import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-hiring';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected to', MONGO_URI);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
};

const candidateSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: String,
  email: String,
  github_url: String,
  github_status: String,
  job_title: String,
  skills_graph: Object,
  
  resume_score: Number,
  github_score: Number,
  match_score: Number,
  final_score: Number,
  decision: String,

  resume_analysis: Object,
  github_analysis: Object,
  consistency_report: Object,
  match_data: Object,
  debate_result: Object,
  explanation: Object,
  bias_audit: Object,

  created_at: { type: Date, default: Date.now }
});

export const Candidate = mongoose.model('Candidate', candidateSchema);

const evaluationLogSchema = new mongoose.Schema({
  evaluation_id: { type: String, required: true, index: true },
  candidate_name: String,
  github_username: String,
  job_description: String,
  timestamp: { type: Date, default: Date.now, index: true },
  agents: [{
    agent_name: String,
    started_at: Date,
    completed_at: Date,
    input_summary: String,
    output: Object,
    confidence_score: Number,
    reasoning: String
  }],
  final_verdict: {
    score: Number,
    recommendation: String,
    key_reasons: [String],
    flags: [String]
  },
  human_review: {
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'flagged'], default: 'pending' },
    reviewer_action: String,
    reviewer_note: String,
    reviewed_at: Date
  }
});

export const EvaluationLog = mongoose.model('EvaluationLog', evaluationLogSchema);
