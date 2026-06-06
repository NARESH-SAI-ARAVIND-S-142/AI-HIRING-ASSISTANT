import { useState } from 'react';
import { Check, X, Flag, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HumanOverridePanel({ evaluationId }) {
  const [action, setAction] = useState(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState(null);
  const [submittedAt, setSubmittedAt] = useState(null);

  const handleSubmit = async () => {
    if (!action) {
      toast.error("Please select an action (Approve, Reject, or Flag)");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/evaluations/${evaluationId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, note })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Review logged successfully!");
        setSubmittedStatus(action);
        setSubmittedAt(new Date().toLocaleString());
      } else {
        throw new Error(data.error || "Failed to submit review");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedStatus) {
    return (
      <div className="glass-card border-amber-500/30 p-6 mt-6">
        <h3 className="text-lg font-display font-bold text-white mb-2">Recruiter Review</h3>
        <p className="text-sm text-slate-300">
          Review logged at {submittedAt}. Status: <strong className="capitalize text-amber-400">{submittedStatus}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card border-amber-500/30 p-6 mt-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
      <h3 className="text-lg font-display font-bold text-white mb-4">Recruiter Review</h3>
      
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setAction('approved')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border transition-all ${
            action === 'approved' 
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-emerald-500/50 hover:text-emerald-400'
          }`}
        >
          <Check className="w-4 h-4" /> Approve
        </button>
        <button
          onClick={() => setAction('rejected')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border transition-all ${
            action === 'rejected' 
              ? 'bg-red-500/20 border-red-500 text-red-400' 
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-red-500/50 hover:text-red-400'
          }`}
        >
          <X className="w-4 h-4" /> Reject
        </button>
        <button
          onClick={() => setAction('flagged')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border transition-all ${
            action === 'flagged' 
              ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-amber-500/50 hover:text-amber-400'
          }`}
        >
          <Flag className="w-4 h-4" /> Flag for Review
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Recruiter Note (Optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add your justification..."
          maxLength={500}
          className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none h-24"
        />
        <div className="text-right text-xs text-slate-500 mt-1">{note.length}/500</div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !action}
          className="btn-primary flex items-center gap-2 px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" /> {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}
