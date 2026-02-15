export function buildStuckSolutionsPrompt(payload = {}) {
  const goal = (payload?.goal || '').trim() || 'Not provided';
  const issues = Array.isArray(payload?.issues) ? payload.issues : [];

  const issuesText = issues.length > 0
    ? issues
      .map((item, idx) => {
        const type = item?.issue_type || 'Unknown issue';
        const intensity = item?.intensity ?? 'N/A';
        const context = item?.context?.trim() || 'No extra context';
        return `${idx + 1}. ${type} | Intensity: ${intensity}/10 | Context: ${context}`;
      })
      .join('\n')
    : 'No issues provided';

  return `
TASK:
Generate a concise, practical stuck-goal solution pack based on user issues.

USER GOAL/AIM:
${goal}

USER ISSUES:
${issuesText}

CRITICAL RULES:
- Be direct, specific, and practical
- Avoid formal/generic motivational language
- Keep each item short (1-3 lines max)
- Use real-world actionable suggestions
- If money issue exists: include low/no-cost alternatives and relevant government funding/scholarship/loan options where applicable
- If resources issue exists: include direct links to useful resources
- If competition anxiety exists: include realistic facts + winner behavior pattern
- Include hyperlinks in valid URL format only
- Output ONLY valid JSON

STRICT JSON STRUCTURE:
{
  "stuck_solution_pack": {
    "quick_summary": [
      "",
      "",
      ""
    ],
    "solutions": [
      {
        "issue_type": "",
        "solution": "",
        "links": [
          { "label": "", "url": "" }
        ]
      }
    ]
  }
}
`;
}
