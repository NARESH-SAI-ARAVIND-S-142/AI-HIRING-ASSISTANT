import { motion } from 'framer-motion';
import { Network, AlertTriangle } from 'lucide-react';

export default function SkillsGraph({ skillsGraph }) {
  if (!skillsGraph) return null;

  const categories = Object.keys(skillsGraph).filter(k => k !== 'skill_gaps');
  const gaps = skillsGraph.skill_gaps || [];

  return (
    <div className="glass-card p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Network className="w-5 h-5 text-brand-cyan" />
        <h3 className="text-lg font-display font-bold text-white">Skills Matrix</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const skills = skillsGraph[cat] || [];
            if (skills.length === 0) return null;

            return (
              <div key={cat}>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 capitalize">
                  {cat.replace('_', ' ')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      key={skill.name}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border relative group cursor-help ${
                        skill.proficiency === 'expert' ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary' :
                        skill.proficiency === 'experienced' ? 'bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan' :
                        'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {skill.name}
                      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-black/90 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {skill.proficiency}: {skill.evidence}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Skill Gaps */}
        {gaps.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 h-fit">
            <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" /> Detected Skill Gaps
            </h4>
            <ul className="space-y-2">
              {gaps.map((gap, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-amber-500/50 mt-1">•</span>
                  Missing expected adjacent skill: <strong className="text-white">{gap}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
