import { model, extractJSON } from './gemini.js';

export const analyzeResume = async (rawText) => {
  const prompt = `
You are an expert technical recruiter analyzing a resume.
Extract the key information from the following resume text and format it as a clean JSON object. 

Return ONLY the JSON with the following structure:
{
  "skills_detailed": ["skill1", "skill2"],
  "roles": ["role1", "role2"],
  "projects": ["project1", "project2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "overall_summary": "A 2 sentence summary of the candidate's profile.",
  "confidence_score": 0.9, // Float 0.0-1.0, lower when data is sparse
  "reasoning": "Explain why this confidence score was given based on the resume data."
}

Resume Text:
"""
${rawText}
"""
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return extractJSON(responseText);
};
