import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Home from './pages/Home';
import Evaluate from './pages/Evaluate';
import Dashboard from './pages/Dashboard';
import { FileSearch, LayoutDashboard, Sparkles } from 'lucide-react';

function NavLink({ to, icon: Icon, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`relative px-4 py-2 rounded-full flex items-center space-x-2 transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">{children}</span>
      {isActive && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute inset-0 bg-white/10 border border-white/20 rounded-full -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
}

function NavBar() {
  return (
    <nav className="fixed top-0 w-full z-50 py-4 px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between pointer-events-auto">
        <div className="glass-card px-4 py-2 rounded-2xl flex items-center shadow-lg border-white/10">
          <Link to="/" className="flex items-center space-x-2 mr-6 shrink-0">
            <div className="bg-gradient-to-tr from-brand-primary to-brand-cyan p-1.5 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white tracking-tight">
              Hire<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-primary">Sync</span>
            </span>
          </Link>
          
          <div className="flex space-x-1 pl-6 border-l border-white/10">
            <NavLink to="/evaluate" icon={FileSearch}>Evaluate</NavLink>
            <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Background glowing effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-primary/10 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] rounded-full bg-brand-cyan/10 blur-[100px] animate-blob"></div>
      </div>

      <div className="min-h-screen flex flex-col font-sans">
        <NavBar />
        
        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/evaluate" element={<Evaluate />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>

      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#121212',
            color: '#fff',
            border: '1px solid #262626',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
