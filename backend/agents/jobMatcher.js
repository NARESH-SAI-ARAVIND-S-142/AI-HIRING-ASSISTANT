import { model, extractJSON } from './gemini.js';

export const matchJob = async (candidateSkills, jobDescription) => {
  const prompt = `
You are an AI Job Matcher. Compare the candidate's skills with the provided job description.
Do NOT just do keyword matching; use semantic understanding of the requirements vs the skills.

Return a JSON object:
{
  "match_percentage": 75, // Integer 0-100 indicating semantic match
  "matched_skills": [""],
  "missing_critical_skills": [""],
  "gap_analysis": "2 sentence explanation of the gap between candidate and job.",
  "transferable_skills": ["e.g. Has Vue but Job asks for React, understands component lifecycle"]
}

Candidate Skills:
${JSON.stringify(candidateSkills, null, 2)}

Job Description:
"""
${jobDescription}
"""
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return extractJSON(responseText);
};
