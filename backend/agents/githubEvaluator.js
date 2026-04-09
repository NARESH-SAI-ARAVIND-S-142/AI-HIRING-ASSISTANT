import { model, extractJSON } from './gemini.js';

export const evaluateGitHub = async (githubData) => {
  const prompt = `
You are a senior engineering manager evaluating a candidate's GitHub profile.
Analyze the following data containing their repositories, languages, and stars.

Provide a JSON assessment of their technical strength based entirely on this data.
Format:
{
  "technical_strength_summary": "1 sentence summary",
  "primary_languages": ["lang1", "lang2"],
  "repo_quality_assessment": "Analysis of their projects focusing on complexity and scale",
  "red_flags": [],
  "green_flags": ["has highly starred repos", "diverse languages"]
}

GitHub Data:
${JSON.stringify(githubData, null, 2)}
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return extractJSON(responseText);
};
