import { motion } from 'framer-motion';
import { UserSearch, Code2, LineChart, Scale } from 'lucide-react';

const PERSONA_STYLES = {
  strict_recruiter: { 
    icon: UserSearch, 
    label: 'Strict Recruiter',
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  skill_analyst: { 
    icon: Code2, 
    label: 'Skill Analyst',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  practical_evaluator: { 
    icon: LineChart, 
    label: 'Practical Evaluator',
    gradient: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
};

export default function DebatePanel({ debate }) {
  if (!debate) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/5 rounded-xl">
          <Scale className="w-5 h-5 text-brand-primary" />
        </div>
        <h3 className="text-lg font-display font-bold text-white">Recruiter Debate</h3>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {Object.entries(PERSONA_STYLES).map(([key, style]) => {
          const data = debate[key];
          if (!data) return null;
          return <ChatBubble key={key} persona={style} data={data} />;
        })}
      </div>

      {debate.consensus_verdict && (
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Consensus</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              debate.consensus_verdict === 'Accept' ? 'bg-emerald-500/20 text-emerald-400' :
              debate.consensus_verdict === 'Reject' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {debate.consensus_verdict}
            </span>
          </div>
          <p className="text-sm text-slate-400 italic leading-relaxed">
            "{debate.consensus_reasoning}"
          </p>
        </div>
      )}
    </motion.div>
  );
}

function ChatBubble({ persona, data }) {
  const Icon = persona.icon;
  const isAccept = data.verdict === 'Accept';
  const isReject = data.verdict === 'Reject';
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-xl border ${persona.border} ${persona.bg} transition-all`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${persona.gradient}`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-sm text-slate-200">{persona.label}</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
          isAccept ? 'bg-emerald-500/20 text-emerald-400' : 
          isReject ? 'bg-red-500/20 text-red-400' : 
          'bg-amber-500/20 text-amber-400'
        }`}>
          {data.verdict}
        </span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed line-clamp-3" title={data.reasoning}>
        {data.reasoning}
      </p>
    </motion.div>
  );
}
