import { runAgent } from './gemini.js';

const SYSTEM_PROMPT = `You are an expert technical interviewer and hiring manager.
Your task is to generate highly tailored, specific interview questions for a candidate based on their resume, the job description, their skill graph, and any consistencies/inconsistencies found in their profile.
Do NOT generate generic questions (like "What is your biggest weakness?").
Instead, generate 3-5 specific questions that probe deep into the candidate's actual projects, skills, or potential red flags.
For each question, provide the category, the question itself, your rationale for asking it, and what a good expected answer would look like.

Return your response as a JSON object matching this schema:
{
  "questions": [
    {
      "category": "String (e.g., 'Technical Deep Dive', 'Experience Verification', 'Skill Gap Probe')",
      "question": "String",
      "rationale": "String (Why is this a good question for THIS specific candidate?)",
      "expected_answer": "String (What should the interviewer look for in a strong answer?)"
    }
  ]
}
`;

export const generateInterviewQuestions = async (jobDescription, parsedResume, skillsGraph, consistencyReport) => {
  const prompt = `
  Job Description:
  ${jobDescription}

  Candidate Resume Data:
  ${JSON.stringify({
    name: parsedResume.name,
    experience: parsedResume.experience,
    projects: parsedResume.projects,
  }, null, 2)}

  Skills Graph:
  ${JSON.stringify(skillsGraph, null, 2)}

  Consistency/Debate Report:
  ${JSON.stringify(consistencyReport, null, 2)}

  Generate tailored interview questions based on the above.
  `;

  return await runAgent(SYSTEM_PROMPT, prompt);
};
