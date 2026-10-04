import React, { useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Leaf, Shield, Zap, Globe, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from)_0%,_transparent_50%)] from-emerald-100/40">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-8 border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 rotate-3 transform hover:rotate-0 transition-transform">
            <Leaf className="text-white w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Carbon<span className="text-emerald-600 italic">IQ</span></h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">
              Track, reduce, and master your environmental impact with intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full py-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center space-y-2 group hover:bg-white hover:shadow-md transition-all">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center space-y-2 group hover:bg-white hover:shadow-md transition-all">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Impact</span>
            </div>
          </div>

          <button 
            onClick={signInWithGoogle}
            className="w-full bg-slate-900 text-white rounded-2xl py-4 px-6 flex items-center justify-center space-x-3 font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 active:scale-[0.98]"
          >
            <Globe className="w-5 h-5" />
            <span>Sign in with Google</span>
            <ArrowRight className="w-4 h-4 opacity-50" />
          </button>
          
          <p className="text-[10px] text-slate-400 font-medium px-4 leading-normal">
            By continuing, you agree to our terms and join a community working towards a net-zero future.
          </p>
        </div>
      </motion.div>
      
      <div className="mt-12 flex space-x-8 opacity-20 filter grayscale">
        <Globe className="w-6 h-6" />
        <Leaf className="w-6 h-6" />
        <Shield className="w-6 h-6" />
        <Zap className="w-6 h-6" />
      </div>
    </div>
  );
};
