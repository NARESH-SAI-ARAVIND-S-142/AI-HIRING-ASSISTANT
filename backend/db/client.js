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
  job_title: String,
  
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

  created_at: { type: Date, default: Date.now }
});

export const Candidate = mongoose.model('Candidate', candidateSchema);
