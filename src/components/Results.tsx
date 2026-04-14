import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  HeartPulse, 
  ShieldAlert, 
  RefreshCw,
  Zap,
  Moon,
  Droplets,
  Sparkles,
  Activity,
  Thermometer,
  Wind,
  Sun,
  Flame,
  Bug,
  Leaf,
  Stethoscope,
  Beaker
} from 'lucide-react';
import { motion } from 'motion/react';
import { HealthAnalysis } from '../services/geminiService';
import { cn } from '../lib/utils';

interface ResultsProps {
  analysis: HealthAnalysis;
  onReset: () => void;
}

export const Results: React.FC<ResultsProps> = ({ analysis, onReset }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20 shadow-[inset_0_0_20px_rgba(52,211,153,0.05)]';
      case 'fair': return 'text-amber-400 bg-amber-400/5 border-amber-400/20 shadow-[inset_0_0_20px_rgba(251,191,36,0.05)]';
      case 'concerning': return 'text-rose-400 bg-rose-400/5 border-rose-400/20 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]';
      default: return 'text-zinc-400 bg-zinc-400/5 border-zinc-400/20';
    }
  };

  const getStatusPercentage = (status: string) => {
    switch (status) {
      case 'good': return 90;
      case 'fair': return 50;
      case 'concerning': return 20;
      default: return 0;
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-emerald-400';
      case 'fair': return 'bg-amber-400';
      case 'concerning': return 'bg-rose-400';
      default: return 'bg-zinc-400';
    }
  };

  const getIndicatorIcon = (label: string, status: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('cardiovascular') || lowerLabel.includes('heart')) return <HeartPulse className="w-5 h-5" />;
    if (lowerLabel.includes('digestive') || lowerLabel.includes('gut')) return <Leaf className="w-5 h-5" />;
    if (lowerLabel.includes('hormonal')) return <Activity className="w-5 h-5" />;
    if (lowerLabel.includes('liver') || lowerLabel.includes('kidney')) return <Beaker className="w-5 h-5" />;
    if (lowerLabel.includes('immune') || lowerLabel.includes('inflammation')) return <ShieldAlert className="w-5 h-5" />;
    if (lowerLabel.includes('hydration') || lowerLabel.includes('skin')) return <Droplets className="w-5 h-5" />;
    if (lowerLabel.includes('fatigue') || lowerLabel.includes('nervous')) return <Moon className="w-5 h-5" />;
    
    switch (status) {
      case 'good': return <CheckCircle2 className="w-5 h-5" />;
      case 'fair': return <Info className="w-5 h-5" />;
      case 'concerning': return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-8 pb-20"
    >
      {/* Header Summary */}
      <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <HeartPulse className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Analysis Complete</h2>
            <p className="text-cyan-400/80 text-sm font-mono uppercase tracking-widest mt-1">AuraScan Biometric Report</p>
          </div>
        </div>
        <p className="text-zinc-200 text-lg leading-relaxed italic relative z-10 font-light border-l-2 border-cyan-500/50 pl-6 py-2">
          "{analysis.summary}"
        </p>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.indicators.map((indicator, idx) => (
          <motion.div
            key={indicator.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between backdrop-blur-md hover:shadow-lg",
              getStatusColor(indicator.status)
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-lg tracking-tight text-white">{indicator.label}</span>
                <div className="p-2 rounded-xl bg-black/20 backdrop-blur-sm">
                  {getIndicatorIcon(indicator.label, indicator.status)}
                </div>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-light">
                {indicator.observation}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-auto pt-4 border-t border-current/10">
              <div className="flex justify-between text-xs font-mono uppercase tracking-wider mb-2 opacity-70">
                <span>Status</span>
                <span>{indicator.status}</span>
              </div>
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getStatusPercentage(indicator.status)}%` }}
                  transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                  className={cn("h-full rounded-full", getProgressBarColor(indicator.status))}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10 tracking-tight">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <ArrowRight className="w-5 h-5 text-cyan-400" />
          </div>
          Personalized Recommendations
        </h3>
        <div className="space-y-4 relative z-10">
          {analysis.recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
              className="flex items-start gap-4 p-5 bg-black/20 rounded-2xl border border-white/5 hover:bg-black/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                <span className="text-cyan-400 text-sm font-bold">{idx + 1}</span>
              </div>
              <p className="text-zinc-300 leading-relaxed font-light pt-1">{rec}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
        <div className="flex items-center gap-3 mb-2 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wider">Medical Disclaimer</span>
        </div>
        <p className="text-rose-400/80 text-xs leading-relaxed">
          {analysis.disclaimer} AuraScan is an AI-powered wellness tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </p>
      </div>

      {/* Action */}
      <div className="flex justify-center pt-8 pb-12">
        <button
          onClick={onReset}
          className="group relative px-10 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center gap-3">
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Scan Again
          </span>
        </button>
      </div>
    </motion.div>
  );
};
