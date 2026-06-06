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

  const agentsLog = [];

  const runWithLog = async (name, inputSummary, fn, ...args) => {
    const started_at = new Date();
    const output = await fn(...args);
    const completed_at = new Date();
    
    agentsLog.push({
      agent_name: name,
      started_at,
      completed_at,
      input_summary: inputSummary,
      output: output,
      confidence_score: output.confidence_score || 0.9,
      reasoning: output.reasoning || "Evaluation completed."
    });
    return output;
  };

  // 1 & 2 run in parallel
  console.log("-> Running Resume Analyzer & GitHub Evaluator...");
  const [resumeAnalysis, githubAssessment] = await Promise.all([
    runWithLog("Resume Analyzer", "Raw resume text", analyzeResume, parsedResume.raw_text),
    githubData ? runWithLog("GitHub Auditor", "GitHub profile data", evaluateGitHub, githubData) : Promise.resolve(null),
  ]);

  // 3 & 4 need the earlier data
  console.log("-> Running Job Matcher & Consistency Checker...");
  const [matchData, consistency] = await Promise.all([
    runWithLog("Job Matcher", "Candidate skills vs Job description", matchJob, parsedResume.skills, jobDescription),
    runWithLog("Consistency Checker", "Resume data vs GitHub data", checkConsistency, parsedResume, githubData),
  ]);

  const agentData = { resumeAnalysis, githubAssessment, matchData, consistency };

  // 5 & 6 run in parallel at the end
  console.log("-> Running Explainability Agent & Debate Agent...");
  const [explanation, debateResult] = await Promise.all([
    runWithLog("Explainability Agent", "Candidate scores and partial agent data", explainDecision, mlScores, agentData),
    runWithLog("Debate Agent", "Full candidate context", runDebate, { parsedResume, githubData, agentData }),
  ]);

  console.log("-> Pipeline Complete.");

  return {
    resumeAnalysis, githubAssessment, matchData, consistency,
    explanation,
    debateResult,
    agentsLog
  };
};
