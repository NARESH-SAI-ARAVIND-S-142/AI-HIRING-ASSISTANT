import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import UploadPanel from '../components/UploadPanel';
import AgentProgress from '../components/AgentProgress';

export default function Evaluate() {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleEvaluate = async (formData) => {
    setIsProcessing(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/evaluate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const result = await response.json();
      toast.success(`${result.candidate?.name || 'Candidate'} evaluated successfully!`, { duration: 3000 });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Evaluation failed. Check that Backend & ML services are running.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <AnimatePresence mode="wait">
        {!isProcessing ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <UploadPanel onSubmit={handleEvaluate} />
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AgentProgress />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
