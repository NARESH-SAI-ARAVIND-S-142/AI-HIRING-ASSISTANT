import { Link } from 'react-router-dom';
import { ArrowRight, Bot, GitBranch, FileSearch, Sparkles, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col items-center justify-center pt-10"
    >
      <motion.div variants={itemVariants} className="text-center max-w-4xl space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" /> v2.0 Multi-Agent Engine Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-white leading-tight">
          Evaluate Candidates with <br/>
          <span className="text-gradient">Multi-Agent Intelligence</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Skip the keyword matching. HireSync AI uses 6 independent generative agents to debate, audit, and truly understand a developer's real-world skills.
        </p>

        <motion.div variants={itemVariants} className="flex justify-center pt-4">
          <Link to="/evaluate" className="btn-primary py-4 px-8 text-lg rounded-2xl group">
            Start Evaluation 
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Feature Grid */}
      <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-8 mt-24 mb-12 w-full max-w-6xl">
        <FeatureCard 
          icon={<Bot className="w-8 h-8 text-brand-primary" />}
          title="Resume Analyzer"
          desc="Extracts deep technical context from PDFs, eliminating bias and hallucination."
        />
        <FeatureCard 
          icon={<GitBranch className="w-8 h-8 text-brand-cyan" />}
          title="Verifiable Skills"
          desc="Cross-references resume claims natively with actual GitHub contribution metrics."
        />
        <FeatureCard 
          icon={<BrainCircuit className="w-8 h-8 text-purple-400" />}
          title="Consensus Debate"
          desc="Simulates three recruiter personas that argue to find the ultimate truth."
        />
      </motion.div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5 }}
      className="glass-card p-8 group transition-all"
    >
      <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
}
