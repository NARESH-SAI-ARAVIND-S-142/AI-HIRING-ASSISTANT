import express from 'express';
import { upload } from '../middleware/upload.js';
import { parseResume, getScores } from '../services/mlService.js';
import { fetchGitHubProfile } from '../services/githubService.js';
import { runEvaluationPipeline } from '../services/agentOrchestrator.js';
import { Candidate } from '../db/client.js';
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

    // 3. Get ML Scores
    console.log("-> Computings ML Scores...");
    const jobKeywords = jobDescription.toLowerCase().match(/\b\w+\b/g) || [];
    const mlScoreData = await getScores(parsedResume, githubData, jobKeywords);

    // 4. Run the Agent Pipeline
    const agentResults = await runEvaluationPipeline(parsedResume, githubData, mlScoreData.scores, jobDescription);

    // 5. Save to DB
    const candidateRecord = new Candidate({
      id: uuidv4(),
      name: parsedResume.name,
      email: parsedResume.email,
      github_url: gitUrl,
      job_title: jobDescription.split('\n')[0].substring(0, 50),
      
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
    });

    await candidateRecord.save();
    console.log(`-> Saved Candidate ${parsedResume.name} with ID ${candidateRecord.id}`);

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
