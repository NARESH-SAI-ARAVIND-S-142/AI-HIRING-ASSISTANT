import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ConsistencyReport({ report }) {
  if (!report) return null;

  const score = report.consistency_score || 0;
  const isGood = score >= 70;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-brand-cyan" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">Integrity Audit</h3>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
          isGood ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {score}/100
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        {/* Verified Claims */}
        <div>
          <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Claims
          </h4>
          <ul className="space-y-2">
            {report.verified_claims?.map((item, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-sm p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
              >
                <span className="font-medium text-slate-200 block mb-1">{item.claim}</span>
                <span className="text-slate-500 text-xs">{item.evidence}</span>
              </motion.li>
            ))}
            {(!report.verified_claims || report.verified_claims.length === 0) && (
              <li className="text-sm text-slate-600 italic">No verified claims found.</li>
            )}
          </ul>
        </div>

        {/* Mismatches */}
        <div>
          <h4 className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Red Flags
          </h4>
          <ul className="space-y-2">
            {report.mismatches?.map((item, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-sm p-3 rounded-lg bg-red-500/5 border border-red-500/10"
              >
                <span className="font-medium text-slate-200 block mb-1">{item.claim}</span>
                <span className="text-slate-500 text-xs">{item.evidence}</span>
              </motion.li>
            ))}
            {(!report.mismatches || report.mismatches.length === 0) && (
              <li className="text-sm text-slate-600 italic">No mismatches detected — looking good!</li>
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
