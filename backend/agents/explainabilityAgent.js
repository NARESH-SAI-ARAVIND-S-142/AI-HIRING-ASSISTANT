import { model, extractJSON } from './gemini.js';

export const explainDecision = async (candidateScores, agentData) => {
  const prompt = `
You are the Explainability AI for a hiring system.
Your job is to read all the raw data and scores for a candidate, and translate the decision into a clear, concise, and professional human-readable explanation.
Keep it strictly factual, objective, and empathetic. NO black-box "the machine said so" answers.

Return a JSON object:
{
  "explanation_paragraph": "A single cohesive paragraph (about 3-4 sentences) explaining exactly why the candidate got their final score and decision, referencing both resume and GitHub data.",
  "key_strengths_phrases": ["Strong GitHub activity in React", "High match for core requirements"],
  "key_weakness_phrases": ["Lack of backend experience", "Inconsistent open source activity"]
}

Candidate Data:
Candidate Scores: ${JSON.stringify(candidateScores)}
Resume Analysis: ${JSON.stringify(agentData.resumeAnalysis)}
GitHub Assessment: ${JSON.stringify(agentData.githubAssessment)}
Match Data: ${JSON.stringify(agentData.matchData)}
Consistency: ${JSON.stringify(agentData.consistency)}
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return extractJSON(responseText);
};
