export function buildNoGoalSummaryPrompt(payload = {}) {
  const q1 = Array.isArray(payload?.question1) ? payload.question1.join(", ") : "Not provided";
  const q2 = Array.isArray(payload?.question2) ? payload.question2.join(", ") : "Not provided";
  const q3 = Array.isArray(payload?.question3) ? payload.question3.join(", ") : "Not provided";

  return `
TASK:
Create a positive, career-oriented interpretation of the user's answers.

USER ANSWERS:
- Q1 (activities to avoid): ${q1}
- Q2 (natural gravitation): ${q2}
- Q3 (success definition): ${q3}

RULES:
- Keep tone confident and constructive
- Bullet points only inside arrays
- Use personalized language that references the user's preferences
- No markdown
- Output JSON only

STRICT JSON STRUCTURE:
{
  "personalized_summary": {
    "title": "Based on your answers, here's what we understand about you",
    "identity_archetype": "",
    "summary_points": [
      "",
      "",
      "",
      "",
      ""
    ],
    "strength_breakdown": {
      "analytical": "",
      "risk_tolerance": "",
      "social_energy": "",
      "creativity_drive": "",
      "execution_consistency": ""
    },
    "career_family": {
      "primary": "",
      "secondary": "",
      "parallel": ""
    },
    "risk_stability_meter": {
      "risk_score": "",
      "stability_score": "",
      "note": ""
    },
    "week_1_challenge": [
      "",
      "",
      ""
    ]
  }
}
`;
}

export function buildNoGoalCareerTablePrompt(payload = {}) {
  const q1 = Array.isArray(payload?.question1) ? payload.question1.join(", ") : "Not provided";
  const q2 = Array.isArray(payload?.question2) ? payload.question2.join(", ") : "Not provided";
  const q3 = Array.isArray(payload?.question3) ? payload.question3.join(", ") : "Not provided";

  return `
TASK:
Generate a career match table with 3-4 rows for a user who does not know their goal.

USER ANSWERS:
- Q1 (activities to avoid): ${q1}
- Q2 (natural gravitation): ${q2}
- Q3 (success definition): ${q3}

RULES:
- Return 3 to 4 rows only
- Each row must include career_cluster, why_it_fits_you, sample_roles, match_score
- sample_roles should be 2-4 concrete roles
- match_score should be numeric-like percentage string (example: "86%")
- No markdown
- Output JSON only

STRICT JSON STRUCTURE:
{
  "career_match_table": [
    {
      "career_cluster": "",
      "why_it_fits_you": "",
      "sample_roles": ["", ""],
      "match_score": ""
    },
    {
      "career_cluster": "",
      "why_it_fits_you": "",
      "sample_roles": ["", ""],
      "match_score": ""
    },
    {
      "career_cluster": "",
      "why_it_fits_you": "",
      "sample_roles": ["", ""],
      "match_score": ""
    }
  ]
}
`;
}
