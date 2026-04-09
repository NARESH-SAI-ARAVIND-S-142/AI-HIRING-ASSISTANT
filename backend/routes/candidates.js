import express from 'express';
import { Candidate } from '../db/client.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ created_at: -1 });
    res.json({ success: true, candidates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ id: req.params.id });
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Candidate.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
