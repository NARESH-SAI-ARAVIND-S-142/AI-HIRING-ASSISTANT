import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileSearch, ExternalLink, Sparkles, ChevronRight, Users } from 'lucide-react';
import ScoreCard from '../components/ScoreCard';
import DebatePanel from '../components/DebatePanel';
import ConsistencyReport from '../components/ConsistencyReport';

export default function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/candidates');
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates);
        if (data.candidates.length > 0 && !selectedCandidate) {
          setSelectedCandidate(data.candidates[0]);
        }
      }
    } catch (e) {
      toast.error("Failed to load candidates. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Empty state
  if (!loading && candidates.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <div className="p-6 bg-white/5 rounded-full mb-6">
          <Users className="w-12 h-12 text-slate-600" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">No Candidates Yet</h2>
        <p className="text-slate-500 mb-8 max-w-md">Upload a resume on the Evaluate page to see AI-powered results appear here.</p>
        <Link to="/evaluate" className="btn-primary px-6 py-3">
          <FileSearch className="w-4 h-4" /> Start First Evaluation
        </Link>
      </motion.div>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const c = selectedCandidate;

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-3 space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-2 mb-4">
          Evaluated Candidates ({candidates.length})
        </h3>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {candidates.map((candidate) => (
            <motion.div 
              key={candidate.id}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedCandidate(candidate)}
              className={`p-4 rounded-xl cursor-pointer transition-all border group ${
                c?.id === candidate.id 
                  ? 'bg-brand-primary/10 border-brand-primary/30'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-slate-100 truncate">{candidate.name}</h4>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${c?.id === candidate.id ? 'text-brand-primary' : 'text-slate-600 group-hover:text-slate-400'}`} />
              </div>
              <p className="text-xs text-slate-500 truncate mt-1">{candidate.job_title || 'No job title'}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  candidate.decision === 'Shortlist' ? 'bg-emerald-500/15 text-emerald-400' : 
                  candidate.decision === 'Review' ? 'bg-amber-500/15 text-amber-400' : 
                  'bg-red-500/15 text-red-400'
                }`}>
                  {candidate.decision}
                </span>
                <span className="text-xs font-bold text-slate-400">{candidate.final_score}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail View */}
      <AnimatePresence mode="wait">
        {c && (
          <motion.div 
            key={c.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="lg:col-span-9 space-y-6"
          >
            {/* Header */}
            <div className="glass-card p-6 flex flex-col sm:flex-row justify-between items-start gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-primary via-purple-400 to-brand-cyan"></div>
              <div>
                <h2 className="text-2xl font-display font-bold text-white">{c.name}</h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  {c.github_url && (
                    <a href={c.github_url} target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" /> GitHub
                    </a>
                  )}
                  {c.email && <span className="text-slate-500">{c.email}</span>}
                </div>
              </div>
              <div className={`px-5 py-2.5 rounded-xl font-display font-bold text-sm shrink-0 ${
                c.decision === 'Shortlist' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                c.decision === 'Review' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {c.decision}
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreCard title="Final Score" score={c.final_score} highlight />
              <ScoreCard title="Resume" score={c.resume_score} />
              <ScoreCard title="GitHub" score={c.github_score} />
              <ScoreCard title="Match" score={c.match_score} />
            </div>

            {/* Explanation Box */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                <h3 className="text-lg font-display font-bold text-white">AI Explanation</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {c.explanation?.explanation_paragraph || "No explanation generated for this candidate."}
              </p>
            </motion.div>

            {/* Debate + Consistency */}
            <div className="grid md:grid-cols-2 gap-6">
              <DebatePanel debate={c.debate_result} />
              <ConsistencyReport report={c.consistency_report} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
