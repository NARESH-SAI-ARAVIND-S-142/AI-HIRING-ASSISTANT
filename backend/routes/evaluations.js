import express from 'express';
import { EvaluationLog, Candidate } from '../db/client.js';
import { generateInterviewQuestions } from '../agents/interviewAgent.js';

const router = express.Router();

// GET /api/evaluations - returns all past evaluations with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const evaluations = await EvaluationLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await EvaluationLog.countDocuments();

    res.json({
      success: true,
      data: evaluations,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch Evaluations Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// GET /api/evaluations/:id - returns full audit log for one evaluation
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const evaluation = await EvaluationLog.findOne({ evaluation_id: id });
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    res.json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Fetch Evaluation Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// PATCH /api/evaluations/:id/review - updates human_review
router.patch('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;

    if (!['approved', 'rejected', 'flagged'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be approved, rejected, or flagged.' });
    }

    const evaluation = await EvaluationLog.findOne({ evaluation_id: id });
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    evaluation.human_review = {
      status: action,
      reviewer_action: action,
      reviewer_note: note || null,
      reviewed_at: new Date()
    };

    await evaluation.save();

    res.json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Update Human Review Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});


// POST /api/evaluations/:id/interview-questions - Generates AI interview questions
router.post('/:id/interview-questions', async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findById(id);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const questions = await generateInterviewQuestions(
      candidate.job_title,
      {
        name: candidate.name,
        experience: candidate.resume_analysis?.experience || [],
        projects: candidate.resume_analysis?.projects || []
      },
      candidate.skills_graph,
      candidate.consistency_report
    );

    res.json({ success: true, data: questions });
  } catch (error) {
    console.error('Generate Interview Questions Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
