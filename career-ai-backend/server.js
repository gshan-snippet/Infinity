import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getModel } from "./geminiClient.js";

import {
  SYSTEM_PROMPT,
  buildUniversalIntakePrompt,
  buildContextExpansionPrompt,
  buildSectionPrompt
} from "./promptBuilder.js";
import {
  buildNoGoalSummaryPrompt,
  buildNoGoalCareerTablePrompt
} from "./promptBuilderOption2.js";
import { buildStuckSolutionsPrompt } from "./promptBuilderOption3.js";
import { buildAlternativeGoalsPrompt } from "./promptBuilderOption4.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

const corsOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools and same-origin/server-to-server requests
      if (!origin) return callback(null, true);
      if (corsOrigins.length === 0) return callback(null, true);
      if (corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Return JSON for malformed JSON bodies (instead of HTML error page)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON body' });
  }
  next(err);
});

// Serve uploaded files as static
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok" });
});

const model = getModel();

// File paths
const USERS_FILE = path.join(__dirname, 'users.json');
const ACTIVITIES_FILE = path.join(__dirname, 'activities.json');
const INFINIGRAM_POSTS_FILE = path.join(__dirname, 'database', 'infinigram_posts.json');
const INFINIGRAM_USERS_FILE = path.join(__dirname, 'database', 'infinigram_users.json');

/* ================= INFINIGRAM DATABASE HELPERS ================= */

function loadInfinigamPostsDB() {
  try {
    if (!fs.existsSync(INFINIGRAM_POSTS_FILE)) {
      fs.writeFileSync(INFINIGRAM_POSTS_FILE, JSON.stringify({ posts: [] }, null, 2), 'utf-8');
      return { posts: [] };
    }
    const data = fs.readFileSync(INFINIGRAM_POSTS_FILE, 'utf-8');
    return JSON.parse(data || '{"posts":[]}');
  } catch (err) {
    console.error('Error loading infinigram posts:', err);
    return { posts: [] };
  }
}

function saveInfinigamPostsDB(data) {
  try {
    fs.writeFileSync(INFINIGRAM_POSTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('âœ… Infinigram posts saved to database');
  } catch (err) {
    console.error('Error saving infinigram posts:', err);
  }
}

/* ================= INFINIGRAM MESSAGES DATABASE ================= */

const INFINIGRAM_MESSAGES_FILE = path.join(__dirname, 'database', 'infinigram_messages.json');

function loadMessages() {
  try {
    if (!fs.existsSync(INFINIGRAM_MESSAGES_FILE)) {
      fs.writeFileSync(INFINIGRAM_MESSAGES_FILE, JSON.stringify({ messages: [] }, null, 2), 'utf-8');
      return { messages: [] };
    }
    const data = fs.readFileSync(INFINIGRAM_MESSAGES_FILE, 'utf-8');
    return JSON.parse(data || '{"messages":[]}');
  } catch (err) {
    console.error('Error loading infinigram messages:', err);
    return { messages: [] };
  }
}

function saveMessages(data) {
  try {
    fs.writeFileSync(INFINIGRAM_MESSAGES_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('âœ… Infinigram messages saved to database');
  } catch (err) {
    console.error('Error saving infinigram messages:', err);
  }
}

/* ================= USER DATA HELPERS ================= */

function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, '{}', 'utf-8');
      return {};
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('Error loading users:', err);
    return {};
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    console.log('âœ… Users saved');
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

function loadActivities() {
  try {
    if (!fs.existsSync(ACTIVITIES_FILE)) {
      fs.writeFileSync(ACTIVITIES_FILE, '{}', 'utf-8');
      return {};
    }
    const data = fs.readFileSync(ACTIVITIES_FILE, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('Error loading activities:', err);
    return {};
  }
}

function saveActivities(activities) {
  try {
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2), 'utf-8');
    console.log('âœ… Activities saved');
  } catch (err) {
    console.error('Error saving activities:', err);
  }
}

/* ================= AI HELPERS ================= */

function stripCodeFences(text) {
  return text.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
}

function extractBalancedJson(text) {
  const start = text.indexOf("{");
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") depth--;
    if (depth === 0) return text.slice(start, i + 1);
  }
  throw new Error("Unbalanced JSON");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err) {
  const message = String(err?.message || "").toLowerCase();
  return err?.status === 429 || message.includes("too many requests") || message.includes("quota exceeded");
}

function getRetryDelayMs(err) {
  const details = Array.isArray(err?.errorDetails) ? err.errorDetails : [];
  const retryInfo = details.find((item) =>
    String(item?.["@type"] || "").includes("google.rpc.RetryInfo")
  );
  const retryDelay = retryInfo?.retryDelay;
  if (typeof retryDelay === "string") {
    if (retryDelay.endsWith("s")) {
      const seconds = Number(retryDelay.replace("s", ""));
      if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);
    }
    const ms = Number(retryDelay);
    if (Number.isFinite(ms) && ms >= 0) return ms;
  }
  return 1200;
}

async function runPrompt(prompt, maxTokens = 3000) {
  const maxAttempts = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`⏳ Calling Gemini API with ${maxTokens} max tokens...`);

      const result = await model.generateContent(
        [SYSTEM_PROMPT, prompt],
        { temperature: 0.2, maxOutputTokens: maxTokens }
      );

      console.log(`✅ Got response from Gemini API`);

      const raw = result.response.text();
      console.log(`📝 Raw response length: ${raw.length} chars`);
      console.log(`📝 First 300 chars: ${raw.substring(0, 300)}`);

      const cleaned = stripCodeFences(raw);
      console.log(`🧹 Cleaned response length: ${cleaned.length} chars`);

      const extracted = extractBalancedJson(cleaned);
      console.log(`📦 Extracted JSON length: ${extracted.length} chars`);

      const parsed = JSON.parse(extracted);
      console.log(`✅ Successfully parsed JSON, keys: ${Object.keys(parsed).join(", ")}`);

      return parsed;
    } catch (err) {
      lastError = err;
      console.error(`❌ ERROR in runPrompt (attempt ${attempt}/${maxAttempts}): ${err.message}`);

      if (attempt < maxAttempts && isRateLimitError(err)) {
        const retryDelayMs = Math.min(getRetryDelayMs(err), 5000);
        console.log(`⏱️ Rate limit detected, retrying in ${retryDelayMs}ms...`);
        await sleep(retryDelayMs);
        continue;
      }

      break;
    }
  }

  console.error(`Stack trace:`, lastError?.stack);
  throw lastError;
}

function normalizeStuckSolutionPack(payload = {}, result = {}) {
  const fallbackMessage = "Unable to generate full AI details right now. Start with one small, consistent action on this issue today.";
  const selectedIssues = Array.isArray(payload?.issues) ? payload.issues : [];
  const pack = result?.stuck_solution_pack && typeof result.stuck_solution_pack === "object"
    ? result.stuck_solution_pack
    : {};
  const aiSolutions = Array.isArray(pack.solutions) ? pack.solutions : [];

  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const sanitizeLinks = (links) => {
    if (!Array.isArray(links)) return [];
    return links
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        label: String(item.label || "Resource").trim() || "Resource",
        url: String(item.url || "").trim()
      }))
      .filter((item) => isValidUrl(item.url));
  };

  const findMatchingSolution = (issueType) => {
    const normalizedIssue = String(issueType || "").toLowerCase().trim();
    if (!normalizedIssue) return null;

    const exact = aiSolutions.find((row) =>
      String(row?.issue_type || "").toLowerCase().trim() === normalizedIssue
    );
    if (exact) return exact;

    return aiSolutions.find((row) =>
      String(row?.issue_type || "").toLowerCase().includes(normalizedIssue) ||
      normalizedIssue.includes(String(row?.issue_type || "").toLowerCase())
    ) || null;
  };

  let normalizedSolutions = [];

  if (selectedIssues.length > 0) {
    normalizedSolutions = selectedIssues.map((issue) => {
      const issueType = String(issue?.issue_type || "Issue").trim() || "Issue";
      const matched = findMatchingSolution(issueType);
      const context = String(issue?.context || "").trim();
      const intensity = Number(issue?.intensity || 0);

      const fallback = context
        ? `Start with this blocker first: ${context}. Break it into one step you can finish in 30-60 minutes, then repeat daily.`
        : `Treat "${issueType}" as priority. Convert it into one measurable action this week, then review progress every 2 days.`;

      const solution = String(matched?.solution || "").trim() || fallback;
      const links = sanitizeLinks(matched?.links);

      return {
        issue_type: issueType,
        solution: intensity >= 8 ? `${solution} Keep the first step very small to avoid burnout.` : solution,
        links
      };
    });
  } else {
    normalizedSolutions = aiSolutions
      .filter((row) => row && typeof row === "object")
      .slice(0, 6)
      .map((row) => ({
        issue_type: String(row.issue_type || "Issue").trim() || "Issue",
        solution: String(row.solution || "").trim() || fallbackMessage,
        links: sanitizeLinks(row.links)
      }));
  }

  if (normalizedSolutions.length === 0) {
    normalizedSolutions = [
      {
        issue_type: "General blocker",
        solution: fallbackMessage,
        links: []
      }
    ];
  }

  let quickSummary = Array.isArray(pack.quick_summary)
    ? pack.quick_summary.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 4)
    : [];

  if (quickSummary.length === 0) {
    quickSummary = normalizedSolutions
      .slice(0, 3)
      .map((row) => row.solution)
      .filter(Boolean);
  }

  return {
    stuck_solution_pack: {
      quick_summary: quickSummary,
      solutions: normalizedSolutions
    }
  };
}

function buildFallbackNoGoalSummary(payload = {}) {
  const q1 = Array.isArray(payload.question1) ? payload.question1 : [];
  const q2 = Array.isArray(payload.question2) ? payload.question2 : [];
  const q3 = Array.isArray(payload.question3) ? payload.question3 : [];
  const avoidText = q1.length ? q1.join(", ") : "highly repetitive and misaligned work";
  const gravity = q2[0] || "a practical, balanced role";
  const success = q3[0] || "stability with meaningful growth";

  return {
    personalized_summary: {
      title: "Based on your answers, here's what we understand about you",
      identity_archetype: "Practical Growth Seeker",
      summary_points: [
        `You are clear about avoiding ${avoidText}, which helps narrow down better-fit careers quickly.`,
        `Your natural pull toward ${gravity} suggests strong intrinsic motivation when work feels purposeful.`,
        `Your success definition points to ${success}, so long-term fit matters more than short-term hype.`,
        "You are likely to perform best in structured environments with visible progress and clear milestones.",
        "You can build momentum fast by testing focused paths instead of exploring too many options at once."
      ],
      strength_breakdown: {
        analytical: "Moderate to strong; you prefer clarity and practical logic before committing.",
        risk_tolerance: "Balanced; open to growth when risk is manageable and outcomes are visible.",
        social_energy: "Context-dependent; strongest in goal-oriented collaboration.",
        creativity_drive: "Applied creativity; you prefer useful ideas over abstract experimentation.",
        execution_consistency: "Good potential with simple systems, weekly review, and measurable targets."
      },
      career_family: {
        primary: "Structured professional tracks",
        secondary: "Applied technical or analytical roles",
        parallel: "People-impact roles with stable progression"
      },
      risk_stability_meter: {
        risk_score: "Moderate",
        stability_score: "High",
        note: "You can take calculated risks, but stability and direction remain your core anchors."
      },
      week_1_challenge: [
        "Shortlist 3 role clusters aligned to your preferences and remove 2 obvious misfits.",
        "Talk to 2 people already in those roles and note required skills + timeline.",
        "Start one 7-day action plan with daily 45-60 minute focused work blocks."
      ]
    }
  };
}

function buildFallbackNoGoalCareerTable(payload = {}) {
  const q2 = Array.isArray(payload.question2) ? payload.question2 : [];
  const q3 = Array.isArray(payload.question3) ? payload.question3 : [];
  const anchor = q2[0] || "practical career outcomes";
  const success = q3[0] || "stable growth";

  return {
    career_match_table: [
      {
        career_cluster: "Government & Public Service Tracks",
        why_it_fits_you: `Aligns with your preference for ${success} and clear exam-driven progression.`,
        sample_roles: ["Civil Services", "State PSC Roles", "SSC / Banking Officer"],
        match_score: "84%"
      },
      {
        career_cluster: "Applied Healthcare & Allied Services",
        why_it_fits_you: `Lets you convert ${anchor} into impact-oriented work with strong demand.`,
        sample_roles: ["Allied Health Professional", "Public Health Operations", "Medical Lab Specialist"],
        match_score: "81%"
      },
      {
        career_cluster: "Data-Enabled Professional Roles",
        why_it_fits_you: "Good fit if you want measurable progress, skill stacking, and flexible career mobility.",
        sample_roles: ["Data Analyst", "Operations Analyst", "Business Intelligence Associate"],
        match_score: "78%"
      }
    ]
  };
}

function buildFallbackAlternativeGoals(payload = {}) {
  const goal = String(payload?.goal || "your goal").trim();
  const reason = String(payload?.reason || "current constraints").trim();

  return {
    alternative_goals_result: {
      alternative_paths: [
        `Keep "${goal}" as long-term target, but split it into phase-wise milestones over 12-24 months.`,
        `Use low-cost preparation route first (official syllabus, past papers, free mock tests, peer groups).`,
        `Adopt a dual-track strategy: primary prep for "${goal}" plus one employable skill backup path.`,
        `Create a strict weekly review system focused on weak areas linked to: ${reason}.`
      ],
      similar_goals: [
        "A closely related domain role with lower entry barrier but similar long-term growth.",
        "A parallel professional path where your existing preparation is still reusable.",
        "A skills-first route that can later bridge back into your original goal.",
        "A stable backup career with predictable progression and strong employability."
      ]
    }
  };
}

/* ================= NORMALIZATION ================= */

function normalizeUserPayload(body) {
  const clar = body.clarification_answers || {};
  return {
    age: body.age,
    gender: body.gender,
    country: body.country,
    location: body.location || null,
    latitude: body.latitude || null,
    longitude: body.longitude || null,
    current_status: body.current_status,
    education_details: body.education
      ? `Degree: ${body.education.degree_name}, Field: ${body.education.specialization}`
      : null,
    hours_per_day: body.hours_per_day,
    goal: body.goal,
    constraints: body.constraints,
    prior_experience: clar.programming_exposure || null,
    specialization_interest: clar.interest_area || null
  };
}

/* ================= RESPONSE FILE HANDLER ================= */

function saveResponseToFile(data) {
  const filePath = path.join(__dirname, 'response.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');
  console.log('âœ… Response saved to response.json');
}

/* ================= AUTHENTICATION ENDPOINTS ================= */

// Signup
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const users = loadUsers();

    if (users[email]) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Save user
    users[email] = {
      password,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    saveUsers(users);

    // Initialize empty activities for new user
    // Initialize empty activities for new user
    const activities = loadActivities();
    if (!activities[email]) {
      activities[email] = [];
      saveActivities(activities);
    }

    return res.json({
      success: true,
      message: 'Signup successful',
      email,
      profile: {
        name: '',
        email: email,
        location: ''
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: 'Signup failed' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const users = loadUsers();

    if (!users[email]) {
      return res.status(401).json({ success: false, error: 'Email or password incorrect' });
    }

    if (users[email].password !== password) {
      return res.status(401).json({ success: false, error: 'Email or password incorrect' });
    }

    // Update last login
    users[email].lastLogin = new Date().toISOString();
    saveUsers(users);

    // Get user activities
    const activities = loadActivities();
    const userActivities = activities[email] || [];

    const profile = users[email].profile || {
      name: '',
      email: email,
      location: ''
    };

    return res.json({
      success: true,
      email,
      activities: userActivities,
      profile: profile
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

/* ================= INFINIGRAM AUTH ================= */

// Infinigram Signup
app.post('/api/infinigram/signup', (req, res) => {
  try {
    const { email, username, password, dob, userType } = req.body;

    if (!email || !username || !password || !dob || !userType) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const users = loadUsers();

    // TASK 1: Verify main account exists with this email
    if (!users[email]) {
      return res.status(401).json({ 
        success: false, 
        error: 'Main account not found with this email. Please create a main account first.' 
      });
    }

    // TASK 1: Check if this main account already has an infinigram profile
    if (users[email].infinigram) {
      return res.status(400).json({ 
        success: false, 
        error: 'You already have an Infinigram account with this email. Please login instead.' 
      });
    }

    // Check if username is already taken in infinigram
    for (const userEmail in users) {
      if (users[userEmail].infinigram?.username === username) {
        return res.status(400).json({ success: false, error: 'Username already taken' });
      }
    }

    // Create infinigram profile nested under main account
    users[email].infinigram = {
      id: Date.now().toString(),
      email: email,
      username: username,
      password: password,
      dob: dob,
      userType: userType,
      profilePhoto: '',
      bio: '',
      followers: 0,
      following: 0,
      posts: [],
      followersList: [],
      followingList: [],
      pendingFollowRequests: [],
      activities_log: [
        {
          type: 'infinigram_signup',
          timestamp: new Date().toISOString(),
          details: `Created Infinigram account as ${userType}`
        }
      ],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    saveUsers(users);

    return res.json({
      success: true,
      message: 'Infinigram signup successful',
      user: {
        id: users[email].infinigram.id,
        email: email,
        username: username,
        dob: dob,
        profilePhoto: '',
        followers: 0,
        following: 0,
        userType: userType
      }
    });
  } catch (err) {
    console.error('Infinigram signup error:', err);
    res.status(500).json({ success: false, error: 'Signup failed' });
  }
});

// Infinigram Login
app.post('/api/infinigram/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const users = loadUsers();

    // TASK 1: Verify main account exists with this email
    if (!users[email]) {
      return res.status(401).json({ 
        success: false, 
        error: 'Main account not found with this email. Please create a main account first.' 
      });
    }

    // Check if infinigram profile exists under this main account
    if (!users[email].infinigram) {
      return res.status(401).json({ 
        success: false, 
        error: 'Infinigram account not found. Please sign up first.' 
      });
    }

    const infinigram_user = users[email].infinigram;

    // Verify password
    if (infinigram_user.password !== password) {
      return res.status(401).json({ success: false, error: 'Email or password incorrect' });
    }

    // Update last login and log activity
    users[email].infinigram.lastLogin = new Date().toISOString();
    if (!users[email].infinigram.activities_log) {
      users[email].infinigram.activities_log = [];
    }
    users[email].infinigram.activities_log.push({
      type: 'infinigram_login',
      timestamp: new Date().toISOString()
    });
    saveUsers(users);

    return res.json({
      success: true,
      user: {
        id: infinigram_user.id,
        email: infinigram_user.email,
        username: infinigram_user.username,
        dob: infinigram_user.dob,
        profilePhoto: infinigram_user.profilePhoto,
        followers: infinigram_user.followers,
        following: infinigram_user.following,
        userType: infinigram_user.userType
      }
    });
  } catch (err) {
    console.error('Infinigram login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

/* ================= INFINIGRAM PROFILE ENDPOINTS ================= */

// Get Infinigram profile
app.get('/api/infinigram/profile/:email', (req, res) => {
  try {
    const { email } = req.params;
    const users = loadUsers();

    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'Infinigram profile not found' });
    }

    const infinigram = users[email].infinigram;
    return res.json({
      success: true,
      profile: {
        id: infinigram.id,
        email: infinigram.email,
        username: infinigram.username,
        dob: infinigram.dob,
        userType: infinigram.userType,
        profilePhoto: infinigram.profilePhoto,
        bio: infinigram.bio,
        followers: infinigram.followers,
        following: infinigram.following,
        createdAt: infinigram.createdAt,
        lastLogin: infinigram.lastLogin
      }
    });
  } catch (err) {
    console.error('Error getting Infinigram profile:', err);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

// Update Infinigram profile
app.post('/api/infinigram/profile/update', (req, res) => {
  try {
    const { email, username, bio, profilePhoto } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email required' });
    }

    const users = loadUsers();

    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'Infinigram profile not found' });
    }

    // Update profile fields
    if (username) users[email].infinigram.username = username;
    if (bio) users[email].infinigram.bio = bio;
    if (profilePhoto !== undefined) users[email].infinigram.profilePhoto = profilePhoto;

    // Log activity
    if (!users[email].infinigram.activities_log) {
      users[email].infinigram.activities_log = [];
    }
    users[email].infinigram.activities_log.push({
      type: 'profile_updated',
      timestamp: new Date().toISOString(),
      changes: { username, bio, profilePhoto: !!profilePhoto }
    });

    saveUsers(users);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: users[email].infinigram.id,
        email: users[email].infinigram.email,
        username: users[email].infinigram.username,
        bio: users[email].infinigram.bio,
        profilePhoto: users[email].infinigram.profilePhoto
      }
    });
  } catch (err) {
    console.error('Error updating Infinigram profile:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

/* ================= INFINIGRAM FOLLOW SYSTEM ================= */

// Search users by username
app.get('/api/infinigram/search/users/:query', (req, res) => {
  try {
    const { query } = req.params;
    console.log(`ðŸ” Search request for: "${query}"`);
    
    const users = loadUsers();
    console.log(`ðŸ“Š Total users in database: ${Object.keys(users).length}`);
    
    const results = [];

    // Search through all users with infinigram profiles
    for (const email in users) {
      const user = users[email].infinigram;
      if (user && user.username) {
        console.log(`  Checking user: ${user.username} (${email})`);
        if (user.username.toLowerCase().includes(query.toLowerCase())) {
          console.log(`  âœ… Match found: ${user.username}`);
          results.push({
            id: user.id,
            email: email,
            username: user.username,
            profilePhoto: user.profilePhoto,
            bio: user.bio,
            followers: user.followers || 0,
            following: user.following || 0,
            userType: user.userType
          });
        }
      }
    }

    console.log(`âœ… Search returned ${results.length} results for "${query}"`);
    return res.json({
      success: true,
      results: results
    });
  } catch (err) {
    console.error('âŒ Error searching users:', err);
    res.status(500).json({ success: false, error: 'Search failed: ' + err.message });
  }
});

// Send follow request
app.post('/api/infinigram/follow/request', (req, res) => {
  try {
    const { fromEmail, toEmail } = req.body;
    console.log(`ðŸ“¤ Follow request from ${fromEmail} to ${toEmail}`);

    if (!fromEmail || !toEmail) {
      return res.status(400).json({ success: false, error: 'fromEmail and toEmail required' });
    }

    const users = loadUsers();

    // Check if both users exist
    if (!users[fromEmail]?.infinigram || !users[toEmail]?.infinigram) {
      console.log(`âŒ User not found: ${fromEmail} or ${toEmail}`);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Prevent self-follow
    if (fromEmail === toEmail) {
      console.log(`âŒ Cannot follow yourself`);
      return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
    }

    // Check if already following
    if (users[fromEmail].infinigram.followingList?.includes(toEmail)) {
      console.log(`âŒ Already following`);
      return res.status(400).json({ success: false, error: 'Already following this user' });
    }

    // Check if request already pending
    const recipientPending = users[toEmail].infinigram.pendingFollowRequests || [];
    if (recipientPending.includes(fromEmail)) {
      console.log(`âŒ Request already pending`);
      return res.status(400).json({ success: false, error: 'Follow request already sent' });
    }

    // Add to pending requests
    if (!users[toEmail].infinigram.pendingFollowRequests) {
      users[toEmail].infinigram.pendingFollowRequests = [];
    }
    users[toEmail].infinigram.pendingFollowRequests.push(fromEmail);

    saveUsers(users);

    // Log activity
    if (!users[fromEmail].infinigram.activities_log) {
      users[fromEmail].infinigram.activities_log = [];
    }
    users[fromEmail].infinigram.activities_log.push({
      type: 'follow_request_sent',
      timestamp: new Date().toISOString(),
      targetUser: users[toEmail].infinigram.username
    });

    console.log(`âœ… Follow request sent successfully`);
    return res.json({
      success: true,
      message: 'Follow request sent'
    });
  } catch (err) {
    console.error('âŒ Error sending follow request:', err);
    res.status(500).json({ success: false, error: 'Failed to send follow request: ' + err.message });
  }
});

// Accept follow request - BIDIRECTIONAL follow (both users follow each other)
app.post('/api/infinigram/follow/accept', (req, res) => {
  try {
    const { fromEmail, toEmail } = req.body;
    console.log(`ðŸ“¥ Accept follow request from ${fromEmail} to ${toEmail}`);

    if (!fromEmail || !toEmail) {
      return res.status(400).json({ success: false, error: 'fromEmail and toEmail required' });
    }

    const users = loadUsers();

    // Check if both users exist
    if (!users[fromEmail]?.infinigram || !users[toEmail]?.infinigram) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if request exists
    const pendingRequests = users[toEmail].infinigram.pendingFollowRequests || [];
    if (!pendingRequests.includes(fromEmail)) {
      return res.status(400).json({ success: false, error: 'No pending follow request from this user' });
    }

    // Remove from pending
    users[toEmail].infinigram.pendingFollowRequests = pendingRequests.filter(e => e !== fromEmail);

    // Make it TRULY BIDIRECTIONAL - both users follow each other
    // Initialize lists if they don't exist
    if (!users[toEmail].infinigram.followersList) {
      users[toEmail].infinigram.followersList = [];
    }
    if (!users[toEmail].infinigram.followingList) {
      users[toEmail].infinigram.followingList = [];
    }
    if (!users[fromEmail].infinigram.followersList) {
      users[fromEmail].infinigram.followersList = [];
    }
    if (!users[fromEmail].infinigram.followingList) {
      users[fromEmail].infinigram.followingList = [];
    }

    // Bidirectional: User1 (fromEmail) follows User2 (toEmail)
    if (!users[toEmail].infinigram.followersList.includes(fromEmail)) {
      users[toEmail].infinigram.followersList.push(fromEmail);
      console.log(`  âœ… Added ${fromEmail} to ${toEmail}'s followersList`);
    }
    if (!users[fromEmail].infinigram.followingList.includes(toEmail)) {
      users[fromEmail].infinigram.followingList.push(toEmail);
      console.log(`  âœ… Added ${toEmail} to ${fromEmail}'s followingList`);
    }

    // Bidirectional: User2 (toEmail) follows User1 (fromEmail) back
    if (!users[fromEmail].infinigram.followersList.includes(toEmail)) {
      users[fromEmail].infinigram.followersList.push(toEmail);
      console.log(`  âœ… Added ${toEmail} to ${fromEmail}'s followersList`);
    }
    if (!users[toEmail].infinigram.followingList.includes(fromEmail)) {
      users[toEmail].infinigram.followingList.push(fromEmail);
      console.log(`  âœ… Added ${fromEmail} to ${toEmail}'s followingList`);
    }

    // Update counts for both users
    users[toEmail].infinigram.followers = users[toEmail].infinigram.followersList.length;
    users[toEmail].infinigram.following = users[toEmail].infinigram.followingList.length;
    users[fromEmail].infinigram.followers = users[fromEmail].infinigram.followersList.length;
    users[fromEmail].infinigram.following = users[fromEmail].infinigram.followingList.length;

    saveUsers(users);

    // Log activities
    if (!users[toEmail].infinigram.activities_log) {
      users[toEmail].infinigram.activities_log = [];
    }
    users[toEmail].infinigram.activities_log.push({
      type: 'follow_request_accepted',
      timestamp: new Date().toISOString(),
      followedUser: users[fromEmail].infinigram.username
    });

    if (!users[fromEmail].infinigram.activities_log) {
      users[fromEmail].infinigram.activities_log = [];
    }
    users[fromEmail].infinigram.activities_log.push({
      type: 'follow_accepted',
      timestamp: new Date().toISOString(),
      followedBy: users[toEmail].infinigram.username
    });

    console.log(`âœ… Bidirectional follow created between ${fromEmail} and ${toEmail}`);
    return res.json({
      success: true,
      message: 'Follow request accepted - bidirectional follow created'
    });
  } catch (err) {
    console.error('Error accepting follow request:', err);
    res.status(500).json({ success: false, error: 'Failed to accept follow request' });
  }
});

// Reject follow request
app.post('/api/infinigram/follow/reject', (req, res) => {
  try {
    const { fromEmail, toEmail } = req.body;

    if (!fromEmail || !toEmail) {
      return res.status(400).json({ success: false, error: 'fromEmail and toEmail required' });
    }

    const users = loadUsers();

    // Check if both users exist
    if (!users[fromEmail]?.infinigram || !users[toEmail]?.infinigram) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Remove from pending
    const pendingRequests = users[toEmail].infinigram.pendingFollowRequests || [];
    users[toEmail].infinigram.pendingFollowRequests = pendingRequests.filter(e => e !== fromEmail);

    saveUsers(users);

    return res.json({
      success: true,
      message: 'Follow request rejected'
    });
  } catch (err) {
    console.error('Error rejecting follow request:', err);
    res.status(500).json({ success: false, error: 'Failed to reject follow request' });
  }
});

// Get pending follow requests
app.get('/api/infinigram/follow/pending/:email', (req, res) => {
  try {
    const { email } = req.params;
    const users = loadUsers();

    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const pendingRequests = users[email].infinigram.pendingFollowRequests || [];
    const requestDetails = [];

    // Get details for each pending request
    for (const requesterEmail of pendingRequests) {
      const requester = users[requesterEmail]?.infinigram;
      if (requester) {
        requestDetails.push({
          email: requesterEmail,
          username: requester.username,
          profilePhoto: requester.profilePhoto,
          userType: requester.userType
        });
      }
    }

    // Get message notifications from user's notifications array
    const messageNotifications = users[email].infinigram.notifications || [];

    return res.json({
      success: true,
      pendingRequests: requestDetails,
      messageNotifications: messageNotifications
    });
  } catch (err) {
    console.error('Error getting pending requests:', err);
    res.status(500).json({ success: false, error: 'Failed to get pending requests' });
  }
});

// Get followers list
app.get('/api/infinigram/followers/:email', (req, res) => {
  try {
    const { email } = req.params;
    const users = loadUsers();

    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const followerEmails = users[email].infinigram.followersList || [];
    const followers = [];

    for (const followerEmail of followerEmails) {
      const follower = users[followerEmail]?.infinigram;
      if (follower) {
        followers.push({
          email: followerEmail,
          username: follower.username,
          profilePhoto: follower.profilePhoto,
          userType: follower.userType
        });
      }
    }

    return res.json({
      success: true,
      followers: followers
    });
  } catch (err) {
    console.error('Error getting followers:', err);
    res.status(500).json({ success: false, error: 'Failed to get followers' });
  }
});

// Get following list
app.get('/api/infinigram/following/:email', (req, res) => {
  try {
    const { email } = req.params;
    const users = loadUsers();

    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const followingEmails = users[email].infinigram.followingList || [];
    const following = [];

    for (const followingEmail of followingEmails) {
      const followingUser = users[followingEmail]?.infinigram;
      if (followingUser) {
        following.push({
          email: followingEmail,
          username: followingUser.username,
          profilePhoto: followingUser.profilePhoto,
          userType: followingUser.userType
        });
      }
    }

    return res.json({
      success: true,
      following: following
    });
  } catch (err) {
    console.error('Error getting following list:', err);
    res.status(500).json({ success: false, error: 'Failed to get following list' });
  }
});

// Unfollow user
app.post('/api/infinigram/follow/unfollow', (req, res) => {
  try {
    const { fromEmail, toEmail } = req.body;

    if (!fromEmail || !toEmail) {
      return res.status(400).json({ success: false, error: 'fromEmail and toEmail required' });
    }

    const users = loadUsers();

    // Check if both users exist
    if (!users[fromEmail]?.infinigram || !users[toEmail]?.infinigram) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Remove from following list
    const followingList = users[fromEmail].infinigram.followingList || [];
    users[fromEmail].infinigram.followingList = followingList.filter(e => e !== toEmail);
    users[fromEmail].infinigram.following = Math.max(0, (users[fromEmail].infinigram.following || 0) - 1);

    // Remove from followers list
    const followersList = users[toEmail].infinigram.followersList || [];
    users[toEmail].infinigram.followersList = followersList.filter(e => e !== fromEmail);
    users[toEmail].infinigram.followers = Math.max(0, (users[toEmail].infinigram.followers || 0) - 1);

    saveUsers(users);

    return res.json({
      success: true,
      message: 'Unfollowed user'
    });
  } catch (err) {
    console.error('Error unfollowing user:', err);
    res.status(500).json({ success: false, error: 'Failed to unfollow user' });
  }
});

/* ================= INFINIGRAM POSTS ENDPOINTS ================= */

// Get all posts for user
app.get('/api/infinigram/posts/:email', (req, res) => {
  try {
    const { email } = req.params;
    const users = loadUsers();

    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'Infinigram profile not found' });
    }

    const posts = users[email].infinigram.posts || [];

    return res.json({
      success: true,
      posts: posts
    });
  } catch (err) {
    console.error('Error getting posts:', err);
    res.status(500).json({ success: false, error: 'Failed to get posts' });
  }
});

// Create new post
app.post('/api/infinigram/posts/create', (req, res) => {
  try {
    const { email, caption, description, content, mediaType, mediaPath } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email required' });
    }

    const users = loadUsers();

    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'Infinigram profile not found' });
    }

    // Create new post object
    const newPost = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: users[email].infinigram.id,
      username: users[email].infinigram.username,
      userPhoto: users[email].infinigram.profilePhoto,
      caption: caption || '',
      description: description || '',
      content: content || '',
      media: content || '',
      mediaType: mediaType || 'text',
      mediaPath: mediaPath || '',
      fileName: mediaPath || '',
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      liked: false,
      saved: false,
      likedBy: [],
      savedBy: [],
      commentsList: []
    };

    // Initialize posts array if doesn't exist
    if (!users[email].infinigram.posts) {
      users[email].infinigram.posts = [];
    }

    // Add post to beginning of array
    users[email].infinigram.posts.unshift(newPost);

    // Log activity
    if (!users[email].infinigram.activities_log) {
      users[email].infinigram.activities_log = [];
    }
    users[email].infinigram.activities_log.push({
      type: 'post_created',
      timestamp: new Date().toISOString(),
      postId: newPost.id,
      mediaType: mediaType
    });

    saveUsers(users);

    // ALSO save to infinigram_posts.json for backup/persistence
    const infinigramPostsDb = loadInfinigamPostsDB();
    if (!infinigramPostsDb.posts) {
      infinigramPostsDb.posts = [];
    }
    infinigramPostsDb.posts.unshift(newPost);
    saveInfinigamPostsDB(infinigramPostsDb);

    return res.json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

// Get single post
app.get('/api/infinigram/posts/:email/:postId', (req, res) => {
  try {
    const { email, postId } = req.params;
    const users = loadUsers();

    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'Infinigram profile not found' });
    }

    const posts = users[email].infinigram.posts || [];
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    return res.json({
      success: true,
      post: post
    });
  } catch (err) {
    console.error('Error getting post:', err);
    res.status(500).json({ success: false, error: 'Failed to get post' });
  }
});

// Delete post
app.delete('/api/infinigram/posts/:email/:postId', (req, res) => {
  try {
    const { email, postId } = req.params;
    const users = loadUsers();

    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'Infinigram profile not found' });
    }

    const posts = users[email].infinigram.posts || [];
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const deletedPost = posts[postIndex];
    posts.splice(postIndex, 1);

    // Log activity
    if (!users[email].infinigram.activities_log) {
      users[email].infinigram.activities_log = [];
    }
    users[email].infinigram.activities_log.push({
      type: 'post_deleted',
      timestamp: new Date().toISOString(),
      postId: postId
    });

    saveUsers(users);

    return res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
});

// Like/Unlike post
app.post('/api/infinigram/posts/:email/:postId/like', (req, res) => {
  try {
    const { email, postId } = req.params;
    const { userId, action } = req.body; // action: 'like' or 'unlike'

    const users = loadUsers();

    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'Infinigram profile not found' });
    }

    const posts = users[email].infinigram.posts || [];
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (!post.likedBy) post.likedBy = [];

    if (action === 'like') {
      if (!post.likedBy.includes(userId)) {
        post.likedBy.push(userId);
        post.likes = post.likedBy.length;
      }
    } else if (action === 'unlike') {
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likes = post.likedBy.length;
    }

    // Log activity
    if (!users[email].infinigram.activities_log) {
      users[email].infinigram.activities_log = [];
    }
    users[email].infinigram.activities_log.push({
      type: 'post_liked',
      timestamp: new Date().toISOString(),
      postId: postId,
      action: action
    });

    saveUsers(users);

    return res.json({
      success: true,
      message: action === 'like' ? 'Post liked' : 'Post unliked',
      likes: post.likes
    });
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ success: false, error: 'Failed to like post' });
  }
});

/* ================= FILE UPLOAD ENDPOINTS ================= */

// Upload file for post
app.post('/api/infinigram/upload', (req, res) => {
  try {
    const { fileData, fileName, mediaType, email } = req.body;

    if (!fileData || !fileName || !mediaType || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'fileData, fileName, mediaType, and email are required' 
      });
    }

    console.log(`ðŸ“¤ Uploading file: ${fileName} (${mediaType})`);

    // Determine subdirectory
    let subDir = 'documents';
    if (mediaType.startsWith('image')) subDir = 'images';
    else if (mediaType.startsWith('video')) subDir = 'videos';

    const uploadDir = path.join(__dirname, 'uploads', subDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = fileName.split('.').pop() || 'bin';
    const uniqueFileName = `${email.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${ext}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Convert base64 to binary and write
    // Handle base64 format: data:[mime];base64,XXXXX or just XXXXX
    let base64String = fileData;
    
    // If it starts with data: URI scheme, extract the base64 part
    if (fileData.startsWith('data:')) {
      // Find the last comma which separates mime info from actual base64
      const lastCommaIndex = fileData.lastIndexOf(',');
      if (lastCommaIndex > 0) {
        base64String = fileData.substring(lastCommaIndex + 1);
      }
    }
    
    console.log(`ðŸ” Received file data length: ${fileData.length}`);
    console.log(`ðŸ”§ Extracted base64 length: ${base64String.length}`);
    
    if (!base64String || base64String.length < 10) {
      console.error(`âŒ Invalid base64 data - too short (${base64String.length} chars)`);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid base64 data format - data too short' 
      });
    }
    
    try {
      const binaryData = Buffer.from(base64String, 'base64');
      console.log(`âœ… Binary data size: ${binaryData.length} bytes`);
      
      if (binaryData.length < 100) {
        console.warn(`âš ï¸  Warning: Binary data is very small (${binaryData.length} bytes) - file might be corrupted`);
      }
      
      fs.writeFileSync(filePath, binaryData);
      console.log(`âœ… File written to: ${filePath}`);
    } catch (bufferErr) {
      console.error('Error converting base64 to binary:', bufferErr);
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to process file data: ' + bufferErr.message 
      });
    }

    // Return file URL with backend domain so frontend can access it from any port
    const fileUrl = `/uploads/${subDir}/${uniqueFileName}`;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const fullFileUrl = `${protocol}://${host}${fileUrl}`;
    
    // Verify file was written
    if (!fs.existsSync(filePath)) {
      console.error(`âŒ File was not created at ${filePath}`);
      return res.status(500).json({ 
        success: false, 
        error: 'File was created but verification failed' 
      });
    }
    
    const fileStats = fs.statSync(filePath);
    console.log(`âœ… File saved: ${fileUrl}`);
    console.log(`âœ… File size: ${fileStats.size} bytes`);
    console.log(`âœ… Full URL for client: ${fullFileUrl}`);

    return res.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl: fullFileUrl,
      fileName: uniqueFileName,
      originalName: fileName
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ success: false, error: 'Failed to upload file' });
  }
});

/* ================= INFINIGRAM ACTIVITIES ENDPOINTS ================= */

// Get Infinigram activities log
app.get('/api/infinigram/activities/:email', (req, res) => {
  try {
    const { email } = req.params;
    const users = loadUsers();

    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'Infinigram profile not found' });
    }

    const activitiesLog = users[email].infinigram.activities_log || [];

    return res.json({
      success: true,
      activities: activitiesLog
    });
  } catch (err) {
    console.error('Error getting Infinigram activities:', err);
    res.status(500).json({ success: false, error: 'Failed to get activities' });
  }
});

// Get user activities
app.get('/api/user/activities/:email', (req, res) => {
  try {
    const { email } = req.params;
    const activities = loadActivities();
    const userActivities = activities[email] || [];

    return res.json({
      success: true,
      activities: userActivities
    });
  } catch (err) {
    console.error('Error getting activities:', err);
    res.status(500).json({ success: false, error: 'Failed to get activities' });
  }
});

// Save activity
app.post('/api/user/activity/save', (req, res) => {
  try {
    const { email, activity } = req.body;

    if (!email || !activity) {
      return res.status(400).json({ success: false, error: 'Email and activity required' });
    }

    const activities = loadActivities();

    if (!activities[email]) {
      activities[email] = [];
    }

    // Add activity with timestamp
    const newActivity = {
      ...activity,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    activities[email].push(newActivity);
    saveActivities(activities);

    return res.json({
      success: true,
      message: 'Activity saved',
      activity: newActivity
    });
  } catch (err) {
    console.error('Error saving activity:', err);
    res.status(500).json({ success: false, error: 'Failed to save activity' });
  }
});

/* ================= NOTIFICATION SYSTEM ================= */

// Get notifications (both follow requests and other notifications)
app.get('/api/notifications/:email', (req, res) => {
  try {
    const { email } = req.params;
    const users = loadUsers();

    if (!users[email]) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const notifications = [];

    // Check for pending follow requests (Infinigram)
    if (users[email].infinigram?.pendingFollowRequests) {
      const pendingRequests = users[email].infinigram.pendingFollowRequests;
      for (const requesterEmail of pendingRequests) {
        const requester = users[requesterEmail]?.infinigram;
        if (requester) {
          notifications.push({
            id: 'follow-' + requesterEmail + Date.now(),
            type: 'follow_request',
            sender: {
              email: requesterEmail,
              username: requester.username,
              profilePhoto: requester.profilePhoto
            },
            message: `${requester.username} sent you a follow request`,
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      }
    }

    // Get main account activities that are notification-worthy
    const activities = loadActivities();
    const userActivities = activities[email] || [];
    
    // Filter for notifications
    for (const activity of userActivities) {
      if (activity.type === 'follow_request_received') {
        notifications.push({
          id: 'activity-' + activity.id,
          type: 'follow_request',
          sender: activity.sender,
          message: activity.message,
          timestamp: activity.createdAt,
          read: activity.read || false
        });
      }
    }

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json({
      success: true,
      notifications: notifications
    });
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({ success: false, error: 'Failed to get notifications' });
  }
});

// Get or Update user profile
app.post('/api/user/profile/update', (req, res) => {
  try {
    const { email, profile } = req.body;

    if (!email || !profile) {
      return res.status(400).json({ success: false, error: 'Email and profile required' });
    }

    const users = loadUsers();

    if (!users[email]) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update user profile
    users[email].profile = {
      name: profile.name || '',
      email: profile.email || email,
      location: profile.location || ''
    };
    users[email].lastLogin = new Date().toISOString();

    saveUsers(users);

    return res.json({
      success: true,
      message: 'Profile updated',
      profile: users[email].profile
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Get user profile
app.get('/api/user/profile/:email', (req, res) => {
  try {
    const { email } = req.params;
    const users = loadUsers();

    if (!users[email]) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const profile = users[email].profile || {
      name: '',
      email: email,
      location: ''
    };

    return res.json({
      success: true,
      profile: profile
    });
  } catch (err) {
    console.error('Error getting profile:', err);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

// Endpoint to get saved response.json
app.get("/api/response", (req, res) => {
  try {
    const filePath = path.join(__dirname, 'response.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.status(404).json({ error: 'No response.json file found' });
    }
  } catch (error) {
    console.error('Error reading response.json:', error);
    res.status(500).json({ error: 'Failed to read response.json' });
  }
});

/* ================= NO-GOAL FLOW (OPTION 2) ================= */

app.post("/api/no-goal-summary", async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await runPrompt(buildNoGoalSummaryPrompt(payload), 1400);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("Error generating no-goal summary:", err);
    const payload = req.body || {};
    const fallback = buildFallbackNoGoalSummary(payload);
    return res.json({
      success: true,
      degraded: true,
      warning: "AI quota reached. Returned fallback summary.",
      ...fallback
    });
  }
});

app.post("/api/no-goal-career-table", async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await runPrompt(buildNoGoalCareerTablePrompt(payload), 2200);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("Error generating no-goal career table:", err);
    const payload = req.body || {};
    const fallback = buildFallbackNoGoalCareerTable(payload);
    return res.json({
      success: true,
      degraded: true,
      warning: "AI quota reached. Returned fallback career matches.",
      ...fallback
    });
  }
});

/* ================= STUCK FLOW (OPTION 3) ================= */

app.post("/api/stuck-goal-solutions", async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await runPrompt(buildStuckSolutionsPrompt(payload), 2600);
    const normalized = normalizeStuckSolutionPack(payload, result);
    return res.json({ success: true, ...normalized });
  } catch (err) {
    console.error("Error generating stuck-goal solutions:", err);
    const payload = req.body || {};
    const fallback = normalizeStuckSolutionPack(payload, {});
    return res.json({
      success: true,
      degraded: true,
      warning: "AI quota reached. Returned fallback stuck-goal solutions.",
      ...fallback
    });
  }
});

/* ================= ALTERNATIVE GOALS FLOW (OPTION 4) ================= */

app.post("/api/alternative-goals", async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await runPrompt(buildAlternativeGoalsPrompt(payload), 2200);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("Error generating alternative goals:", err);
    const payload = req.body || {};
    const fallback = buildFallbackAlternativeGoals(payload);
    return res.json({
      success: true,
      degraded: true,
      warning: "AI quota reached. Returned fallback alternative goals.",
      ...fallback
    });
  }
});

// Store progress for clients to poll
const progressStore = {};

// GET endpoint for clients to poll progress
app.get("/api/know-goal-progress/:requestId", (req, res) => {
  const { requestId } = req.params;
  const progress = progressStore[requestId] || { completedSections: 0, currentSection: 0, status: 'pending' };
  console.log(`ðŸ“Š Polling progress for ${requestId}:`, progress);
  res.json(progress);
});

// Main career guidance endpoint
app.post("/api/know-goal-dont-know-start", async (req, res) => {
  try {
    console.log("Incoming request received");

    // Generate unique request ID for this generation
    const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    console.log(`ðŸ“Œ Generated requestId: ${requestId}`);

    progressStore[requestId] = { completedSections: 0, currentSection: 0, status: 'starting', requestId };

    // Send requestId immediately so client can start polling
    res.json({ success: false, requestId: requestId, status: 'generation_started', message: 'Generation started, polling for progress...' });

    // Process in background after sending response
    setImmediate(async () => {
      try {
        const user = normalizeUserPayload(req.body);
        const isClarificationResponse = req.body.is_clarification_response === true;

        /* ---------- BASIC INTAKE ---------- */

        if (!user.age || !user.gender || !user.country || !user.current_status || !user.goal) {
          const intake = await runPrompt(buildUniversalIntakePrompt(), 1000);
          progressStore[requestId] = { completedSections: 0, currentSection: 0, status: 'failed', error: 'basic_intake_required' };
          return;
        }

        /* ---------- CONTEXT EXPANSION (SKIP IF CLARIFICATION RESPONSE) ---------- */

        if (!isClarificationResponse) {
          console.log("Running context expansion...");
          progressStore[requestId].status = 'context_expansion';
          const context = await runPrompt(buildContextExpansionPrompt(user), 1500);
          if (context.additional_information_required?.length > 0) {
            progressStore[requestId] = { completedSections: 0, currentSection: 0, status: 'failed', error: 'additional_information_required' };
            return;
          }
        } else {
          console.log("Skipping context expansion (clarification response)");
        }

        /* ---------- SECTION-BY-SECTION GENERATION ---------- */

        console.log("Starting section generation (1-9)...");
        const finalResult = {};

        for (let section = 1; section <= 9; section++) {
          console.log(`ðŸ”„ Generating section ${section}...`);

          // Update progress - section is currently being processed
          progressStore[requestId] = {
            completedSections: section - 1,
            currentSection: section,
            status: 'generating_section',
            totalSections: 9,
            requestId
          };

          console.log(`ðŸ“Š Updated progress store for ${requestId}:`, progressStore[requestId]);

          const sectionData = await runPrompt(
            buildSectionPrompt(section, user),
            3000
          );
          Object.assign(finalResult, sectionData);

          // Update progress - section completed
          progressStore[requestId] = {
            completedSections: section,
            currentSection: section,
            status: 'section_complete',
            totalSections: 9,
            requestId
          };

          console.log(`âœ… Section ${section} complete. Updated progress:`, progressStore[requestId]);
        }

        // Save response to file
        saveResponseToFile(finalResult);

        // Update final progress
        progressStore[requestId] = {
          completedSections: 9,
          currentSection: 9,
          status: 'complete',
          totalSections: 9,
          data: finalResult,
          requestId
        };

        console.log("All sections complete. Progress store:", progressStore[requestId]);

      } catch (err) {
        console.error("âŒ AI ERROR in background:", err.message);
        const previous = progressStore[requestId] || {};
        progressStore[requestId] = {
          completedSections: typeof previous.completedSections === 'number' ? previous.completedSections : 0,
          currentSection: typeof previous.currentSection === 'number' ? previous.currentSection : 0,
          status: 'failed',
          error: err.message,
          requestId
        };
      }
    });

  } catch (err) {
    console.error("âŒ SETUP ERROR:", err.message);
    res.status(500).json({ success: false, error: "Setup failed", message: err.message });
  }
});

// Add request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(180000); // 3 minutes
  res.setTimeout(180000);
  next();
});

/* ================= INFINIGRAM MESSAGING ENDPOINTS ================= */

// Get list of users to message (mutual follows only)
app.get('/api/infinigram/messages/list/:email', (req, res) => {
  try {
    const { email } = req.params;
    console.log(`ðŸ“¬ Getting message list for ${email}`);

    const users = loadUsers();
    const currentUser = users[email]?.infinigram;

    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get mutual follows - users that follow current user AND current user follows them
    const mutualFollows = [];
    const followersList = currentUser.followersList || [];
    const followingList = currentUser.followingList || [];

    for (const otherEmail of followersList) {
      if (followingList.includes(otherEmail)) {
        // Mutual follow found
        const otherUser = users[otherEmail]?.infinigram;
        if (otherUser) {
          mutualFollows.push({
            email: otherEmail,
            username: otherUser.username,
            profilePhoto: otherUser.profilePhoto
          });
        }
      }
    }

    console.log(`âœ… Found ${mutualFollows.length} mutual follows for ${email}`);
    return res.json({
      success: true,
      contacts: mutualFollows
    });
  } catch (err) {
    console.error('âŒ Error getting message list:', err);
    res.status(500).json({ success: false, error: 'Failed to get message list' });
  }
});

// Get chat history between two users
app.get('/api/infinigram/messages/:email/:otherEmail', (req, res) => {
  try {
    const { email, otherEmail } = req.params;
    console.log(`ðŸ’¬ Getting chat history between ${email} and ${otherEmail}`);

    const users = loadUsers();
    const currentUser = users[email]?.infinigram;
    const otherUser = users[otherEmail]?.infinigram;

    if (!currentUser || !otherUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check mutual follows
    const followersList = currentUser.followersList || [];
    const followingList = currentUser.followingList || [];
    const isMutualFollow = followersList.includes(otherEmail) && followingList.includes(otherEmail);

    if (!isMutualFollow) {
      return res.status(403).json({ success: false, error: 'Can only message mutual follows' });
    }

    // Load messages
    const messagesDB = loadMessages();
    const allMessages = messagesDB.messages || [];

    // Filter messages between these two users
    const chatMessages = allMessages.filter(msg =>
      (msg.fromEmail === email && msg.toEmail === otherEmail) ||
      (msg.fromEmail === otherEmail && msg.toEmail === email)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    console.log(`âœ… Found ${chatMessages.length} messages in chat`);
    return res.json({
      success: true,
      messages: chatMessages,
      otherUser: {
        email: otherEmail,
        username: otherUser.username,
        profilePhoto: otherUser.profilePhoto
      }
    });
  } catch (err) {
    console.error('âŒ Error getting chat history:', err);
    res.status(500).json({ success: false, error: 'Failed to get chat history' });
  }
});

// Send message
app.post('/api/infinigram/messages/send', (req, res) => {
  try {
    const { fromEmail, toEmail, text } = req.body;
    console.log(`ðŸ“¤ Message from ${fromEmail} to ${toEmail}`);

    if (!fromEmail || !toEmail || !text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const users = loadUsers();
    const fromUser = users[fromEmail]?.infinigram;
    const toUser = users[toEmail]?.infinigram;

    if (!fromUser || !toUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check mutual follows
    const fromFollowersList = fromUser.followersList || [];
    const fromFollowingList = fromUser.followingList || [];
    const isMutualFollow = fromFollowersList.includes(toEmail) && fromFollowingList.includes(toEmail);

    if (!isMutualFollow) {
      return res.status(403).json({ success: false, error: 'Can only message mutual follows' });
    }

    // Create message
    const message = {
      id: Date.now().toString(),
      fromEmail,
      toEmail,
      fromUsername: fromUser.username,
      toUsername: toUser.username,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    // Save message
    const messagesDB = loadMessages();
    if (!messagesDB.messages) {
      messagesDB.messages = [];
    }
    messagesDB.messages.push(message);
    saveMessages(messagesDB);

    // Add notification for receiver
    if (!toUser.notifications) {
      toUser.notifications = [];
    }
    toUser.notifications.push({
      id: Date.now().toString(),
      type: 'new_message',
      fromEmail,
      fromUsername: fromUser.username,
      message: text.trim().substring(0, 50), // First 50 chars
      timestamp: new Date().toISOString(),
      read: false
    });

    // Activity logging
    if (!fromUser.activities_log) {
      fromUser.activities_log = [];
    }
    fromUser.activities_log.push({
      type: 'message_sent',
      timestamp: new Date().toISOString(),
      recipient: toUser.username
    });

    saveUsers(users);

    console.log(`âœ… Message sent from ${fromEmail} to ${toEmail}`);
    return res.json({
      success: true,
      message: message
    });
  } catch (err) {
    console.error('âŒ Error sending message:', err);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Mark message as read
app.post('/api/infinigram/messages/read', (req, res) => {
  try {
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ success: false, error: 'messageId required' });
    }

    const messagesDB = loadMessages();
    const message = messagesDB.messages.find(m => m.id === messageId);

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    message.read = true;
    saveMessages(messagesDB);

    return res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (err) {
    console.error('âŒ Error marking message as read:', err);
    res.status(500).json({ success: false, error: 'Failed to mark message as read' });
  }
});

// Delete notification
app.post('/api/infinigram/notifications/delete', (req, res) => {
  try {
    const { email, notificationId } = req.body;

    if (!email || !notificationId) {
      return res.status(400).json({ success: false, error: 'email and notificationId required' });
    }

    const users = loadUsers();
    if (!users[email]?.infinigram) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Remove notification from user's notifications array
    const notifications = users[email].infinigram.notifications || [];
    const filteredNotifications = notifications.filter(n => n.id !== notificationId);
    users[email].infinigram.notifications = filteredNotifications;

    saveUsers(users);

    console.log(`âœ… Notification ${notificationId} deleted for ${email}`);
    return res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (err) {
    console.error('âŒ Error deleting notification:', err);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ðŸš€ Server running on port ${PORT}`);
  console.log(`ðŸ“ Users file: ${USERS_FILE}`);
  console.log(`ðŸ“ Activities file: ${ACTIVITIES_FILE}`);
});

app.use("/api/*", (_req, res) => {
  res.status(404).json({ success: false, error: "API route not found" });
});

app.use((err, _req, res, _next) => {
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, error: "CORS blocked this origin" });
  }
  return res.status(500).json({ success: false, error: "Internal server error" });
});

