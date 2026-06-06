import express from 'express';
import { upload } from '../middleware/upload.js';
import { parseResume, getScores } from '../services/mlService.js';
import { fetchGitHubProfile } from '../services/githubService.js';
import { runEvaluationPipeline } from '../services/agentOrchestrator.js';
import { Candidate, EvaluationLog } from '../db/client.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription || 'Software Engineer';
    const manualGithubUrl = req.body.githubUrl || '';
    
    if (!req.file) {
      return res.status(400).json({ error: 'No resume PDF uploaded' });
    }

    console.log("-> Processing new candidate evaluation...");

    // 1. Pass to ML service for parsing
    console.log("-> Parsing PDF...");
    const parsedResume = await parseResume(req.file.buffer, req.file.originalname);

    // 2. Extract GitHub URL
    let gitUrl = manualGithubUrl || parsedResume.github_url || '';
    let githubData = null;
    
    if (gitUrl) {
      const username = gitUrl.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//, '').split('/')[0];
      if (username) {
        console.log(`-> Fetching GitHub for ${username}...`);
        githubData = await fetchGitHubProfile(username);
      }
    }

    // 3. Determine GitHub Status
    let githubStatus = 'not_provided';
    if (githubData) {
      const publicRepos = githubData.public_repos || 0;
      if (publicRepos === 0) githubStatus = 'private';
      else if (publicRepos < 5) githubStatus = 'limited';
      else githubStatus = 'audited';
    }

    // 4. Get ML Scores
    console.log("-> Computings ML Scores...");
    const jobKeywords = jobDescription.toLowerCase().match(/\b\w+\b/g) || [];
    const mlScoreData = await getScores(parsedResume, githubData, jobKeywords, githubStatus);

    // 5. Run the Agent Pipeline
    const agentResults = await runEvaluationPipeline(parsedResume, githubData, mlScoreData.scores, jobDescription);

    // 5. Save to DB
    const evalId = uuidv4();
    const candidateRecord = new Candidate({
      id: evalId,
      name: parsedResume.name,
      email: parsedResume.email,
      github_url: gitUrl,
      github_status: githubStatus,
      job_title: jobDescription.split('\n')[0].substring(0, 50),
      skills_graph: parsedResume.skills_graph,
      
      resume_score: mlScoreData.scores.resume_score,
      github_score: mlScoreData.scores.github_score,
      match_score: mlScoreData.scores.match_score,
      final_score: mlScoreData.scores.final_score,
      decision: mlScoreData.decision,

      resume_analysis: agentResults.resumeAnalysis,
      github_analysis: agentResults.githubAssessment,
      consistency_report: agentResults.consistency,
      match_data: agentResults.matchData,
      debate_result: agentResults.debateResult,
      explanation: agentResults.explanation,
      bias_audit: mlScoreData.bias_audit,
    });

    await candidateRecord.save();
    console.log(`-> Saved Candidate ${parsedResume.name} with ID ${candidateRecord.id}`);

    const evaluationLog = new EvaluationLog({
      evaluation_id: evalId,
      candidate_name: parsedResume.name,
      github_username: githubData ? githubData.username : null,
      job_description: jobDescription,
      agents: agentResults.agentsLog,
      final_verdict: {
        score: mlScoreData.scores.final_score,
        recommendation: mlScoreData.decision,
        key_reasons: agentResults.explanation.key_strengths_phrases.concat(agentResults.explanation.key_weakness_phrases),
        flags: agentResults.githubAssessment ? agentResults.githubAssessment.red_flags : []
      }
    });

    await evaluationLog.save();
    console.log(`-> Saved Evaluation Log for ID ${evalId}`);

    res.json({
      success: true,
      candidate: candidateRecord
    });
  } catch (error) {
    console.error('Evaluation Route Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
