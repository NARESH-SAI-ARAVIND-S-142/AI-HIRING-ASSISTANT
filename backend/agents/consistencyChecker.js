import { model, extractJSON } from './gemini.js';

export const checkConsistency = async (resumeData, githubData) => {
  const prompt = `
You are a Consistency Checker AI. Your job is to compare what a candidate claims on their resume versus what is actually provable in their GitHub profile.

Identify mismatches (e.g., they claim 10 years of Python, but their GitHub has no Python repos) and verified skills (they claim React, and have 5 React repos).

Return a JSON object:
{
  "consistency_score": 80, // Integer 0-100. 100 means all claims are perfectly backed up.
  "verified_claims": [
    {"claim": "Python experience", "evidence": "Found 3 repositories primarily in Python"}
  ],
  "mismatches": [
    {"claim": "Expert in Rust", "evidence": "No Rust repositories or commits found"}
  ],
  "summary": "General summary of consistency."
}

Resume Data:
${JSON.stringify(resumeData, null, 2)}

GitHub Data:
${JSON.stringify(githubData, null, 2)}
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return extractJSON(responseText);
};
