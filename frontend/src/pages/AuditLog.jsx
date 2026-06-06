import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuditLog() {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLog();
  }, [id]);

  const fetchAuditLog = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/evaluations/${id}`);
      const data = await res.json();
      
      if (data.success) {
        setLog(data.data);
      } else {
        toast.error("Audit log not found");
      }
    } catch (e) {
      toast.error("Failed to fetch audit log");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center py-20 text-white">
        <h2 className="text-2xl font-bold mb-4">Audit Log Not Found</h2>
        <Link to="/dashboard" className="text-brand-cyan hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="glass-card p-6">
        <h1 className="text-2xl font-display font-bold text-white mb-2">
          Evaluation Audit Trail
        </h1>
        <p className="text-slate-400 text-sm">
          Tracking AI reasoning and confidence for candidate <strong className="text-slate-200">{log.candidate_name}</strong>
        </p>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-primary/50 before:via-brand-cyan/20 before:to-transparent">
        {log.agents.map((agent, index) => {
          const start = new Date(agent.started_at);
          const end = new Date(agent.completed_at);
          const duration = (end - start) / 1000;
          const conf = agent.confidence_score || 0;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index} 
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Cpu className="w-4 h-4 text-brand-cyan" />
              </div>

              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-5 rounded-2xl hover:border-brand-primary/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-200 text-lg">{agent.agent_name}</h3>
                  <div className="flex items-center text-xs text-slate-500 bg-black/20 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3 mr-1" /> {duration}s
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Confidence Score</span>
                    <span className="text-xs font-bold text-slate-300">{(conf * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full ${conf >= 0.8 ? 'bg-emerald-500' : conf >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${conf * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reasoning</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {agent.reasoning}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
}
