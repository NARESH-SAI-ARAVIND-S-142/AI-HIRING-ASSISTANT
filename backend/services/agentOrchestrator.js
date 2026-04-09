import { analyzeResume } from '../agents/resumeAnalyzer.js';
import { evaluateGitHub } from '../agents/githubEvaluator.js';
import { matchJob } from '../agents/jobMatcher.js';
import { checkConsistency } from '../agents/consistencyChecker.js';
import { explainDecision } from '../agents/explainabilityAgent.js';
import { runDebate } from '../agents/debateAgent.js';

/**
 * Orchestrates the full AI multi-agent evaluation pipeline.
 */
export const runEvaluationPipeline = async (parsedResume, githubData, mlScores, jobDescription) => {
  console.log("-> Starting Agent Pipeline...");

  // 1 & 2 run in parallel
  console.log("-> Running Resume Analyzer & GitHub Evaluator...");
  const [resumeAnalysis, githubAssessment] = await Promise.all([
    analyzeResume(parsedResume.raw_text),
    githubData ? evaluateGitHub(githubData) : Promise.resolve(null),
  ]);

  // 3 & 4 need the earlier data
  console.log("-> Running Job Matcher & Consistency Checker...");
  const [matchData, consistency] = await Promise.all([
    matchJob(parsedResume.skills, jobDescription),
    checkConsistency(parsedResume, githubData),
  ]);

  const agentData = { resumeAnalysis, githubAssessment, matchData, consistency };

  // 5 & 6 run in parallel at the end
  console.log("-> Running Explainability Agent & Debate Agent...");
  const [explanation, debateResult] = await Promise.all([
    explainDecision(mlScores, agentData),
    runDebate({ parsedResume, githubData, agentData }),
  ]);

  console.log("-> Pipeline Complete.");

  return {
    ...agentData,
    explanation,
    debateResult
  };
};
