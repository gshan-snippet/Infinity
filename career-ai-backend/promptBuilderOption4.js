export function buildAlternativeGoalsPrompt(payload = {}) {
  const goal = (payload?.goal || '').trim() || 'Not provided';
  const reason = (payload?.reason || '').trim() || 'Not provided';

  return `
TASK:
Given a user's original goal and reason for seeking alternatives, generate:
1) Alternative paths to reach the same goal (different approach/route)
2) Different but similar goals

USER INPUT:
- Goal: ${goal}
- Reason: ${reason}

RULES:
- Keep output practical and specific
- Avoid generic motivational language
- Keep each point concise
- Output JSON only

STRICT JSON STRUCTURE:
{
  "alternative_goals_result": {
    "alternative_paths": [
      "",
      "",
      "",
      ""
    ],
    "similar_goals": [
      "",
      "",
      "",
      ""
    ]
  }
}
`;
}
