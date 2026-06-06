import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterviewQuestions({ evaluationId }) {
  const [questions, setQuestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const generateQuestions = async () => {
    setIsGenerating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/evaluations/${evaluationId}/interview-questions`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.success && data.data?.questions) {
        setQuestions(data.data.questions);
        toast.success("Interview questions generated successfully!");
      } else {
        throw new Error("Failed to generate questions.");
      }
    } catch (e) {
      toast.error(e.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-card p-6 mt-6 border-purple-500/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-display font-bold text-white">AI Interview Prep</h3>
        </div>
        
        {!questions && (
          <button
            onClick={generateQuestions}
            disabled={isGenerating}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'Generating...' : 'Generate Questions'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {questions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <p className="text-sm text-slate-400 mb-4">
              These questions are tailored to probe the candidate's specific background, skill gaps, and project claims.
            </p>
            
            {questions.map((q, idx) => (
              <div key={idx} className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div>
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1 block">
                      {q.category}
                    </span>
                    <h4 className="text-sm font-medium text-slate-200 pr-8">
                      {q.question}
                    </h4>
                  </div>
                  {expandedIndex === idx ? (
                    <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4"
                    >
                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Why ask this?</span>
                          <p className="text-sm text-slate-300 italic">{q.rationale}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1 block">What to look for</span>
                          <p className="text-sm text-slate-300">{q.expected_answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
