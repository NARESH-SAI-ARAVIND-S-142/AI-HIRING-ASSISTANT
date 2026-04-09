import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, GitBranch, CheckCircle, BrainCircuit, Users, Shield } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Extracting Resume Data', desc: 'Parsing PDF text, skills, and hyperlinks...', icon: FileText, color: 'from-violet-500 to-purple-600' },
  { id: 2, name: 'Fetching GitHub Profile', desc: 'Pulling repos, stars, forks & commits...', icon: GitBranch, color: 'from-cyan-500 to-blue-600' },
  { id: 3, name: 'ML Feature Engineering', desc: 'Scoring through trained ML models...', icon: BrainCircuit, color: 'from-green-500 to-emerald-600' },
  { id: 4, name: 'Consistency Audit', desc: 'Cross-referencing resume claims vs GitHub...', icon: Shield, color: 'from-amber-500 to-orange-600' },
  { id: 5, name: 'Multi-Agent Debate', desc: '3 recruiter personas arguing the case...', icon: Users, color: 'from-pink-500 to-rose-600' },
  { id: 6, name: 'Finalizing Decision', desc: 'Aggregating scores and consensus...', icon: Bot, color: 'from-brand-primary to-brand-cyan' },
];

export default function AgentProgress() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2200);
    
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min((currentStep / STEPS.length) * 100, 100);

  return (
    <div className="glass-card p-8 md:p-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-brand-primary to-brand-cyan transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>

      <div className="mb-10 text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-brand-primary text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping"></div>
          Live Processing
        </div>
        <h3 className="text-3xl font-display font-bold text-white">Agents Analyzing...</h3>
        <p className="text-slate-400 max-w-lg mx-auto">Our multi-agent pipeline is scrutinizing this candidate through 6 independent evaluation stages.</p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isPending = currentStep < step.id;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                isActive 
                  ? 'bg-white/5 border-white/20 shadow-lg'
                  : isCompleted
                  ? 'bg-white/[0.02] border-white/5'
                  : 'border-transparent opacity-40'
              }`}
            >
              <div className={`relative shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                isActive ? `bg-gradient-to-br ${step.color} shadow-lg` :
                isCompleted ? 'bg-emerald-500/20' : 'bg-white/5'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                )}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl animate-ping bg-white/10"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                    {step.name}
                  </span>
                </div>
                {(isActive || isCompleted) && (
                  <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                )}
              </div>

              {isActive && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
              )}
              {isCompleted && (
                <span className="text-xs text-emerald-400 font-medium shrink-0">Done</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
