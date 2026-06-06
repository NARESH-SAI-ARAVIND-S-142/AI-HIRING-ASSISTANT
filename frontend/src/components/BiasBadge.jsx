import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function BiasBadge({ biasAudit }) {
  if (!biasAudit) return null;

  const isLowRisk = !biasAudit.bias_risk;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium w-max relative group cursor-help ${
      isLowRisk 
        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
    }`}>
      {isLowRisk ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
      <span>
        {isLowRisk ? 'Bias Risk: Low' : `Bias Risk: Detected — delta: ${biasAudit.bias_delta} pts`}
      </span>

      {/* Tooltip */}
      <div className="absolute top-full mt-2 left-0 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-slate-300 font-normal">
        {isLowRisk 
          ? 'Fairness check passed. Re-scoring an anonymized version of the resume yielded a similar score.'
          : 'Fairness check warning. Re-scoring an anonymized version of the resume yielded a score difference greater than 8 points, indicating potential bias.'
        }
      </div>
    </div>
  );
}
