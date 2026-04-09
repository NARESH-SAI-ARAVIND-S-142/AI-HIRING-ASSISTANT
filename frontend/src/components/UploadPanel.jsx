import { useState, useRef } from 'react';
import { FileUp, Link as LinkIcon, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function UploadPanel({ onSubmit }) {
  const [file, setFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      toast.success("PDF attached successfully!");
    } else {
      toast.error("Please drop a valid .pdf file");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      toast.success("PDF attached successfully!");
    } else if (selected) {
      toast.error("Please select a valid .pdf file");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a resume first!");
      return;
    }
    if (!jobDesc.trim()) {
      toast.error("Job constraints cannot be empty.");
      return;
    }
    
    // Check if optional github url is structurally valid if provided
    if(githubUrl.trim() !== '' && !githubUrl.includes('github.com')) {
      toast.error("Invalid GitHub URL format");
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('githubUrl', githubUrl.trim());
    formData.append('jobDescription', jobDesc.trim());
    
    onSubmit(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 md:p-10 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-cyan"></div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Upload Candidate</h2>
          <p className="text-slate-400 text-sm">Upload candidate details and let the multi-agent hive assess their viability.</p>
        </div>

        {/* File Upload Zone */}
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-brand-primary bg-brand-primary/10 scale-[1.02]' : 'border-white/10 hover:border-brand-primary/50 bg-white/5'}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf"
            onChange={handleFileChange}
          />
          <motion.div 
            animate={{ y: isDragging ? -10 : 0 }}
            className={`p-4 rounded-full mb-4 ${file ? 'bg-brand-primary/20' : 'bg-white/10'}`}
          >
            <FileUp className={`w-8 h-8 ${file ? 'text-brand-primary' : 'text-slate-400'}`} />
          </motion.div>
          <h3 className="text-lg font-display font-semibold text-white">
            {file ? file.name : "Upload Resume PDF"}
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            {file ? "Click or drag to change file" : "Drag & drop or click to browse (Max 5MB)"}
          </p>
        </div>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-brand-cyan" /> GitHub Override URL <span className="text-xs text-slate-500 font-normal">(Optional)</span>
            </label>
            <input 
              type="url" 
              placeholder="https://github.com/username"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-cyan transition-colors focus:ring-1 focus:ring-brand-cyan"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-primary" /> Job Requirements
            </label>
            <input 
              type="text" 
              placeholder="e.g. Senior Backend Engineer (Node.js)"
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-primary transition-colors focus:ring-1 focus:ring-brand-primary"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!file}
          className="w-full btn-primary py-4 text-lg"
        >
          Initialize AI Evaluation
        </button>
      </form>
    </motion.div>
  );
}
