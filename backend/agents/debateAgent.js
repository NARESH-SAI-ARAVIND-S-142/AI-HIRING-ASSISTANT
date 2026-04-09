import { model, extractJSON } from './gemini.js';

export const runDebate = async (candidateData) => {
  const prompt = `
You are facilitating a debate between three distinct recruiter personas evaluating a software engineer candidate.
The personas are:
1. Strict Recruiter: Focuses entirely on years of experience, formal education, and exact skill matches against the resume. Highly critical of gaps.
2. Skill Analyst: Ignores the resume and focuses completely on the GitHub code, repositories, complexity, and active commits.
3. Practical Evaluator: Looks at consistency, transferrable skills, and project descriptions to see if the person can actually build things.

Review the candidate data and give the verdict of EACH recruiter (Accept, Reject, Neutral), along with their 1-sentence reasoning. Then provide a final consensus decision based on their votes.

Return a JSON object exactly like this:
{
  "strict_recruiter": { "verdict": "Reject", "reasoning": "..." },
  "skill_analyst": { "verdict": "Accept", "reasoning": "..." },
  "practical_evaluator": { "verdict": "Neutral", "reasoning": "..." },
  "consensus_verdict": "Review", // Must be one of: "Shortlist", "Review", "Reject"
  "consensus_reasoning": "..."
}

Candidate Data:
${JSON.stringify(candidateData, null, 2)}
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return extractJSON(responseText);
};
