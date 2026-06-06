import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Compare() {
  const [candidates, setCandidates] = useState([]);
  const [selectedA, setSelectedA] = useState('');
  const [selectedB, setSelectedB] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/candidates`);
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates);
      }
    } catch (e) {
      toast.error("Failed to load candidates");
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

  if (candidates.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center text-white">
        <Users className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Not Enough Candidates</h2>
        <p className="text-slate-400 mb-6">You need at least two evaluated candidates to use the comparison view.</p>
        <Link to="/evaluate" className="btn-primary px-6 py-2">Evaluate Candidate</Link>
      </div>
    );
  }

  const candidateA = candidates.find(c => c.id === selectedA) || candidates[0];
  const candidateB = candidates.find(c => c.id === selectedB) || candidates[1];

  const chartData = [
    { subject: 'Final Score', A: candidateA?.final_score || 0, B: candidateB?.final_score || 0, fullMark: 100 },
    { subject: 'Resume', A: candidateA?.resume_score || 0, B: candidateB?.resume_score || 0, fullMark: 100 },
    { subject: 'GitHub', A: candidateA?.github_score || 0, B: candidateB?.github_score || 0, fullMark: 100 },
    { subject: 'Match', A: candidateA?.match_score || 0, B: candidateB?.match_score || 0, fullMark: 100 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Users className="text-brand-primary w-8 h-8" />
          Multi-Candidate Comparison
        </h1>
      </div>

      {/* Selectors */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <label className="block text-xs font-semibold text-brand-primary uppercase tracking-wider mb-2">Candidate A (Blue)</label>
          <select 
            value={candidateA.id} 
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
          >
            {candidates.map(c => (
              <option key={c.id} value={c.id} disabled={c.id === candidateB?.id}>{c.name} - {c.job_title}</option>
            ))}
          </select>
        </div>
        
        <div className="glass-card p-4">
          <label className="block text-xs font-semibold text-brand-cyan uppercase tracking-wider mb-2">Candidate B (Cyan)</label>
          <select 
            value={candidateB.id} 
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-cyan/50 transition-colors"
          >
            {candidates.map(c => (
              <option key={c.id} value={c.id} disabled={c.id === candidateA?.id}>{c.name} - {c.job_title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 min-h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-display font-bold text-white mb-6">Score Radar</h3>
          <div className="flex-1 w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Radar name={candidateA.name} dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                <Radar name={candidateB.name} dataKey="B" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-display font-bold text-white mb-6">Head-to-Head Comparison</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 text-xs uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl border-b border-white/5">Metric</th>
                  <th className="px-4 py-3 border-b border-white/5 text-brand-primary">{candidateA.name}</th>
                  <th className="px-4 py-3 rounded-tr-xl border-b border-white/5 text-brand-cyan">{candidateB.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { label: 'Decision', key: 'decision' },
                  { label: 'Final Score', key: 'final_score', highlight: true },
                  { label: 'Resume Score', key: 'resume_score' },
                  { label: 'GitHub Score', key: 'github_score' },
                  { label: 'Match Score', key: 'match_score' },
                  { label: 'GitHub Status', key: 'github_status' },
                  { label: 'Bias Delta', a: candidateA?.bias_audit?.bias_delta || 'N/A', b: candidateB?.bias_audit?.bias_delta || 'N/A' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200">{row.label}</td>
                    <td className={`px-4 py-3 ${row.highlight ? 'font-bold text-white' : ''} ${row.key && candidateA[row.key] > candidateB[row.key] && typeof candidateA[row.key] === 'number' ? 'text-emerald-400' : ''}`}>
                      {row.key ? candidateA[row.key] : row.a}
                    </td>
                    <td className={`px-4 py-3 ${row.highlight ? 'font-bold text-white' : ''} ${row.key && candidateB[row.key] > candidateA[row.key] && typeof candidateB[row.key] === 'number' ? 'text-emerald-400' : ''}`}>
                      {row.key ? candidateB[row.key] : row.b}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Winner Highlight */}
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-brand-primary/10 to-brand-cyan/10 border border-white/10 text-center">
            <span className="text-sm text-slate-400">Recommended Selection: </span>
            <strong className="text-white text-lg ml-2">
              {candidateA.final_score > candidateB.final_score ? candidateA.name : candidateA.final_score < candidateB.final_score ? candidateB.name : 'Tie'}
            </strong>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
