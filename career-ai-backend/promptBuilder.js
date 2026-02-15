/* =========================================================
   Career-AI Bullet-Point Prompt Architecture
   1 SECTION PER REQUEST (ANTI-TRUNCATION MODE)
   ========================================================= */

export const SYSTEM_PROMPT = `
You are a Professional Career Architecture AI used inside a serious Career Guidance Application.

STRICT BEHAVIOR RULES:
- NEVER write paragraphs
- ONLY bullet points
- NO generic motivation
- NO emojis, NO markdown
- NO extra text outside JSON

OUTPUT RULES:
- Output ONLY valid JSON
- Generate ONLY the requested section
`;

/* ================= UNIVERSAL INTAKE ================= */

export function buildUniversalIntakePrompt() {
  return `
TASK:
Ask ONLY for the most basic user information.

STRICT JSON STRUCTURE:
{
  "required_basic_info": {
    "age": "",
    "gender": "",
    "country": "",
    "current_status": "",
    "highest_education_level": "",
    "goal": ""
  },
  "questions_to_ask": []
}
`;
}

/* ================= CONTEXT EXPANSION ================= */

export function buildContextExpansionPrompt(user) {
  return `
User Snapshot:
Age: ${user.age}
Country: ${user.country}
Current Status: ${user.current_status}
Education Details: ${user.education_details}
Goal: ${user.goal}
Constraints: ${user.constraints}

RULES:
- Ask MAX 2 questions
- If enough info exists, return empty arrays

STRICT JSON STRUCTURE:
{
  "additional_information_required": [],
  "reason_for_each_question": {},
  "cannot_proceed_without": []
}
`;
}

/* ================= SECTION PROMPTS ================= */

export function buildSectionPrompt(sectionNumber, user) {
  let specialInstructions = '';
  
  if (sectionNumber === 6) {
    const userLocation = user.location || 'India';
    specialInstructions = `

==== CRITICAL INSTRUCTIONS FOR SECTION 6 ====
TASK: Generate learning resources AND find REAL nearby coaching/training hubs for the goal: "${user.goal}" in the user's location: "${userLocation}"

USER LOCATION DETAILS:
- User's City/Area: "${userLocation}"
- User's Goal: "${user.goal}"
- User's Country: ${user.country || 'India'}

NEARBY COACHING HUBS REQUIREMENT - VERY IMPORTANT:
You MUST generate 3-4 REAL, ACTUAL coaching centers or training institutes that:
1. ARE LOCATED IN OR NEAR "${userLocation}" (the user's actual city/area)
2. SPECIALIZE IN OR ARE RELEVANT TO "${user.goal}"
3. HAVE ACTUAL NAMES (not generic names like "Hub Name 1")
4. USE THE ACTUAL CITY NAME "${userLocation}" in the location field

EXAMPLES FOR DIFFERENT LOCATIONS:
- If "${userLocation}" contains "Delhi": Include real Delhi coaching centers like "IIT Delhi Study Center", "Delhi GATE Academy", "Delhi Coaching Institute for Engineering", etc.
- If "${userLocation}" contains "Mumbai": Include real Mumbai centers like "Mumbai GATE Institute", "Mumbai Engineering Academy", "Bombay Coaching Center for ${user.goal}", etc.
- If "${userLocation}" contains "Bangalore": Include real Bangalore centers like "Bangalore Tech Academy", "South India Training Institute", "Bangalore Coaching Hub for ${user.goal}", etc.
- For any other location: Research and suggest real coaching centers that exist in that specific city for "${user.goal}"

OUTPUT EXACTLY THIS FORMAT - NO DEVIATIONS:
{
  "6_learning_and_preparation_resources": {
    "youtube_channels_or_videos": [
      "Channel/Video name 1 (description)",
      "Channel/Video name 2 (description)",
      "Channel/Video name 3 (description)"
    ],
    "websites_or_platforms": [
      "Website name 1 (domain.com - description)",
      "Website name 2 (domain.com - description)",
      "Website name 3 (domain.com - description)"
    ],
    "books_or_documents": [
      "Book name 1 (category)",
      "Book name 2 (category)",
      "Book name 3 (category)"
    ],
    "question_papers_or_practice_links": [
      "Practice resource 1 (description)",
      "Practice resource 2 (description)",
      "Practice resource 3 (description)"
    ],
    "nearby_coaching_hubs": [
      {
        "name": "ACTUAL COACHING CENTER NAME IN ${userLocation}",
        "type": "Coaching Center or Training Hub",
        "location": "${userLocation}, ${user.country || 'India'}",
        "review_rating": "4.2 to 4.8",
        "specialization": "MUST BE RELATED TO ${user.goal}",
        "distance": "1-5 km from city center"
      },
      {
        "name": "ANOTHER REAL COACHING CENTER IN ${userLocation}",
        "type": "Training Institute or Academy",
        "location": "${userLocation}, ${user.country || 'India'}",
        "review_rating": "4.0 to 4.8",
        "specialization": "MUST BE RELATED TO ${user.goal}",
        "distance": "1-5 km from city center"
      },
      {
        "name": "THIRD REAL COACHING CENTER IN ${userLocation}",
        "type": "Coaching Center or Training Hub",
        "location": "${userLocation}, ${user.country || 'India'}",
        "review_rating": "4.1 to 4.8",
        "specialization": "MUST BE RELATED TO ${user.goal}",
        "distance": "1-5 km from city center"
      },
      {
        "name": "FOURTH REAL COACHING CENTER IN ${userLocation}",
        "type": "Training Center or Academy",
        "location": "${userLocation}, ${user.country || 'India'}",
        "review_rating": "4.0 to 4.7",
        "specialization": "MUST BE RELATED TO ${user.goal}",
        "distance": "2-5 km from city center"
      }
    ]
  }
}

CRITICAL RULES FOR NEARBY COACHING HUBS:
- DO NOT use generic placeholder names like "Hub Name 1", "Coaching Center", "Training Hub"
- MUST use REAL, ACTUAL coaching center names that exist in "${userLocation}"
- MUST include the actual city "${userLocation}" in every location field
- MUST show specialization relevant to "${user.goal}"
- Include realistic distances (1-5 km)
- Include realistic ratings (4.0-4.8 out of 5)
- DO NOT generate hubs from other cities
- DO NOT use demo/placeholder data
- GENERATE ONLY for "${userLocation}" - the user's actual location

IMPORTANT: The nearby_coaching_hubs MUST contain REAL data for "${userLocation}", not generic or placeholder data.

- Generate YouTube channels, websites, books, and practice resources as before
- STOP after section 6 - do not continue
`;
  }
  
  if (sectionNumber === 7) {
    specialInstructions = `

==== CRITICAL INSTRUCTIONS FOR SECTION 7 ====
TASK: Generate realistic income/salary data for the goal: "${user.goal}"

MUST INCLUDE EXPLICIT NUMBERS:
- Entry Level Salary Range: Specific numbers with currency (e.g., "$40,000 - $60,000 per year" OR "₹6,00,000 - ₹10,00,000 per annum")
- Mid-Career Salary Range: 5-10 years experience with numbers
- Senior Level Salary Range: 10+ years experience with numbers
- Bonus/Commission potential if applicable
- Freelance rates if relevant

OUTPUT EXACTLY THIS FORMAT - DO NOT DEVIATE:
{
  "7_rewards_after_achieving_goal": {
    "career_outcomes": [
      "Specific career progression outcome 1",
      "Specific career progression outcome 2",
      "Specific career progression outcome 3"
    ],
    "money_power_fame_or_lifestyle": [
      "Entry Level: $40,000 - $60,000 per year (or equivalent in ${user.country === 'India' ? '₹' : '$'})",
      "Mid-Career: $70,000 - $120,000 per year (or equivalent in ${user.country === 'India' ? '₹' : '$'})",
      "Senior Level: $120,000 - $250,000+ per year (or equivalent in ${user.country === 'India' ? '₹' : '$'})",
      "Bonus/Commission: 15-40% of base salary (varies by company)",
      "Lifestyle benefits: Company perks, flexibility, remote work options"
    ]
  }
}

CRITICAL RULES:
- ALWAYS include specific dollar/rupee amounts
- DO NOT use vague terms like "good salary" or "substantial income"
- DO NOT output paragraphs - ONLY bullet points with numbers
- STOP after section 7 - do not continue
`;
  }
  
  if (sectionNumber === 8) {
    specialInstructions = `

==== CRITICAL INSTRUCTIONS FOR SECTION 8 ====
TASK: Show realistic challenges for: "${user.goal}" using ONLY 2 sections with NUMBERS and STATISTICS

SECTION 1 - FINANCIAL CHALLENGES (Cost to achieve this goal):
- Total cost breakdown in numbers (tuition, certifications, equipment, etc.)
- Monthly expenses during preparation
- Time frame and total investment required
- Example for ISRO Scientist: "Need to spend ₹5-8 lakhs on IIT/engineering education + ₹50,000/month for 2-3 years preparation"

SECTION 2 - COMPETITION & SELECTION RATES (How hard it is):
Use EXACT numbers and statistics:
- For ISRO Scientist: "400,000+ GATE aspirants, only 500-800 selected (0.2% selection rate)"
- For Doctor/NEET: "2,000,000+ NEET aspirants yearly, 75,000 MBBS seats (3.75% selection rate)"
- For Cricketer: "200,000+ cricket hopefuls in India, 15-20 new IPL slots yearly (0.01% chance)"
- For Software Engineer: "500,000+ CS graduates yearly, 50,000 top tier job openings (10% placement rate)"

OUTPUT EXACTLY THIS FORMAT - NO DEVIATIONS:
{
  "8_realistic_hardships_and_sacrifices": {
    "financial_challenges": [
      "Total preparation cost: [EXACT NUMBER + CURRENCY] over [TIME PERIOD]",
      "Monthly expenses during preparation: [NUMBER] per month",
      "Educational cost breakdown: [SPECIFIC AMOUNTS]",
      "Additional certifications/equipment cost: [SPECIFIC AMOUNTS]"
    ],
    "competition_and_selection": [
      "Total annual aspirants in India: [EXACT NUMBER]",
      "Total vacancies/selections per year: [EXACT NUMBER]",
      "Selection rate: [PERCENTAGE]%",
      "Cutoff/benchmark stats: [SPECIFIC DATA]",
      "Years of preparation typically needed: [NUMBER]"
    ]
  }
}

CRITICAL RULES:
- ALWAYS use REAL statistics and numbers for the specific goal
- DO NOT use generic statements
- DO NOT use percentage signs without numbers
- DO NOT output paragraphs - ONLY bullet points with numbers
- REMOVE all emotional/motivational content
- ONLY output these 2 sections (financial + competition) - NO OTHER SECTIONS
- STOP after section 8 - do not continue
`;
  }
  
  if (sectionNumber === 9) {
    specialInstructions = `

==== CRITICAL INSTRUCTIONS FOR SECTION 9 ====
TASK: Suggest realistic alternative career paths to: "${user.goal}"

REQUIREMENTS:
- Provide context for when to consider alternatives
- List 4-5 specific, realistic alternative goals
- Each alternative should be achievable given the user's background and constraints
- Focus on alternatives that leverage similar skills or interests

OUTPUT EXACTLY THIS FORMAT - NO DEVIATIONS:
{
  "9_alternative_or_similar_goals_if_applicable": {
    "when_to_suggest_alternatives": "Specific conditions/situations when alternatives should be considered",
    "recommended_alternative_goals": [
      "Alternative goal 1 - specific and actionable",
      "Alternative goal 2 - specific and actionable",
      "Alternative goal 3 - specific and actionable",
      "Alternative goal 4 - specific and actionable",
      "Alternative goal 5 - specific and actionable"
    ]
  }
}

CRITICAL RULES:
- Generate exactly 4-5 alternative goals
- Make them REAL and ACHIEVABLE alternatives
- Focus on career paths, not conditions
- STOP after section 9 - do not continue
`;
  }

  return `
User Profile:
Age: ${user.age}
Gender: ${user.gender}
Country: ${user.country}
Current Status: ${user.current_status}
Education Details: ${user.education_details}
Available Hours Per Day: ${user.hours_per_day}
Goal: ${user.goal}
Constraints: ${user.constraints}
Location: ${user.location || 'India'}

KNOWN INFO:
- Prior Experience: ${user.prior_experience || "Not provided"}
- Specialization Interest: ${user.specialization_interest || "Not provided"}

IMPORTANT RULES:
- Generate ONLY section ${sectionNumber}
- DO NOT ask questions
- If data missing, make safe assumptions
- Output ONLY JSON
- STOP immediately after section
${specialInstructions}

SECTION JSON FORMAT:
${getSectionSchema(sectionNumber)}
`;
}

/* ================= SECTION SCHEMAS ================= */

function getSectionSchema(n) {
  const schemas = {
    1: `
{
  "1_eligibility_check": {
    "status": "",
    "bullet_points": []
  }
}
`,
    2: `
{
  "2_success_rate_and_possible_paths": {
    "success_rate_percentage": "",
    "possible_paths": []
  }
}
`,
    3: `
{
  "3_how_to_achieve_this_goal": {
    "action_steps": [],
    "practical_tips_and_shortcuts": []
  }
}
`,
    4: `
{
  "4_detailed_domain_knowledge": {
    "important_topics_or_skills": [],
    "important_variations_or_categories": [],
    "what_beginners_should_start_with": []
  }
}
`,
    5: `
{
  "5_real_inspirational_examples": {
    "real_people_or_cases": [],
    "why_they_matter": []
  }
}
`,
    6: `
{
  "6_learning_and_preparation_resources": {
    "youtube_channels_or_videos": [],
    "websites_or_platforms": [],
    "books_or_documents": [],
    "question_papers_or_practice_links": [],
    "nearby_coaching_hubs": [
      {
        "name": "",
        "type": "",
        "location": "",
        "review_rating": "",
        "specialization": "",
        "distance": ""
      }
    ]
  }
}
`,
    7: `
{
  "7_rewards_after_achieving_goal": {
    "career_outcomes": [],
    "money_power_fame_or_lifestyle": []
  }
}
`,
    8: `
{
  "8_realistic_hardships_and_sacrifices": {
    "financial_challenges": [],
    "competition_and_selection": []
  }
}
`,
    9: `
{
  "9_alternative_or_similar_goals_if_applicable": {
    "when_to_suggest_alternatives": "",
    "recommended_alternative_goals": []
  }
}
`
  };

  return schemas[n];
}