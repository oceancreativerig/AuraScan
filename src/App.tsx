import React, { useState } from 'react';
import { Scanner } from './components/Scanner';
import { Results } from './components/Results';
import { analyzeFaceHealth, HealthAnalysis } from './services/geminiService';
import { Shield, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AppState = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'RESULTS' | 'ERROR';

export default function App() {
  const [state, setState] = useState<AppState>('IDLE');
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (base64Image: string) => {
    setState('ANALYZING');
    try {
      const result = await analyzeFaceHealth(base64Image);
      setAnalysis(result);
      setState('RESULTS');
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again in better lighting.");
      setState('ERROR');
    }
  };

  const reset = () => {
    setAnalysis(null);
    setError(null);
    setState('SCANNING');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-cyan-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute w-[800px] h-[800px] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-screen animate-blob opacity-50" />
        <div className="absolute w-[600px] h-[600px] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen animate-blob animation-delay-2000 opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center min-h-screen">
        {/* Header */}
        <header className="text-center mb-16 mt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Biometrics
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent drop-shadow-sm"
          >
            AuraScan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 max-w-xl mx-auto text-lg md:text-xl font-light leading-relaxed"
          >
            Advanced facial analysis for full-body wellness insights and personalized health recommendations.
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {state === 'IDLE' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center gap-8 py-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                <FeatureCard
                  icon={<Shield className="w-8 h-8 text-cyan-400" />}
                  title="Secure Analysis"
                  description="Your biometric data is processed securely and never stored on our servers."
                  delay={0.3}
                />
                <FeatureCard
                  icon={<Activity className="w-8 h-8 text-emerald-400" />}
                  title="Real-time Insights"
                  description="Get instant feedback on hydration, stress, and vitality markers."
                  delay={0.4}
                />
                <FeatureCard
                  icon={<Sparkles className="w-8 h-8 text-purple-400" />}
                  title="AI Wellness"
                  description="Personalized recommendations powered by advanced machine learning."
                  delay={0.5}
                />
              </div>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => setState('SCANNING')}
                className="group relative px-12 py-5 mt-8 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(34,211,238,0.4)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors duration-300">
                  Start Health Scan
                  <Activity className="w-6 h-6 group-hover:animate-pulse" />
                </span>
              </motion.button>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-zinc-500 text-sm flex items-center gap-2 mt-4"
              >
                <Shield className="w-4 h-4" />
                Requires camera access for facial analysis
              </motion.p>
            </motion.div>
          )}

          {(state === 'SCANNING' || state === 'ANALYZING') && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <Scanner onCapture={handleCapture} isAnalyzing={state === 'ANALYZING'} />
              <div className="mt-8 text-center">
                <button
                  onClick={() => setState('IDLE')}
                  className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
                >
                  Cancel Scan
                </button>
              </div>
            </motion.div>
          )}

          {state === 'RESULTS' && analysis && (
            <Results key="results" analysis={analysis} onReset={reset} />
          )}

          {state === 'ERROR' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
              <p className="text-zinc-400 mb-8">{error}</p>
              <button
                onClick={reset}
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-auto pt-20 pb-8 text-center text-zinc-600 text-xs uppercase tracking-[0.2em]">
          © 2026 AuraScan Biometrics • For Informational Purposes Only
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay = 0 }: { icon: React.ReactNode; title: string; description: string; delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="p-8 rounded-3xl glass-panel group cursor-pointer"
    >
      <div className="mb-6 p-4 bg-white/5 rounded-2xl inline-block group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
