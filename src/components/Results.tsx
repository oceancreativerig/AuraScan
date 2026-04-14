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
import { useLanguage } from '../lib/i18n';

interface ResultsProps {
  analysis: HealthAnalysis;
  onReset: () => void;
}

const FaceVisualization: React.FC<{ affectedRegions: string[]; indicators: any[] }> = ({ affectedRegions, indicators }) => {
  const { t } = useLanguage();
  const regions = {
    forehead: { path: "M 30 25 Q 50 15 70 25 L 70 35 Q 50 25 30 35 Z", label: t("Forehead"), pos: { x: 50, y: 15 } },
    eyes: { path: "M 25 45 Q 35 40 45 45 Q 35 50 25 45 M 55 45 Q 65 40 75 45 Q 65 50 55 45", label: t("Eyes"), pos: { x: 20, y: 40 } },
    nose: { path: "M 45 50 Q 50 45 55 50 L 52 65 Q 50 70 48 65 Z", label: t("Nose"), pos: { x: 65, y: 55 } },
    cheeks: { path: "M 20 55 Q 15 70 30 80 M 80 55 Q 85 70 70 80", label: t("Cheeks"), pos: { x: 10, y: 65 } },
    mouth: { path: "M 40 75 Q 50 85 60 75 Q 50 80 40 75", label: t("Mouth"), pos: { x: 50, y: 90 } },
    jawline: { path: "M 15 50 Q 15 95 50 98 Q 85 95 85 50", label: t("Jawline"), pos: { x: 85, y: 80 } },
  };

  const isHighlighted = (region: string) => affectedRegions.includes(region);

  return (
    <div className="relative w-64 h-64 mx-auto mb-12">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
        {/* Face Outline */}
        <path
          d="M 15 40 Q 15 95 50 100 Q 85 95 85 40 Q 85 10 50 5 Q 15 10 15 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className={cn(
            "transition-colors duration-700",
            affectedRegions.includes('skin_overall') ? "text-cyan-400" : "text-zinc-800"
          )}
        />
        
        {Object.entries(regions).map(([key, data]) => (
          <g key={key}>
            <path 
              d={data.path} 
              fill={isHighlighted(key) ? "rgba(34,211,238,0.4)" : "none"} 
              stroke={isHighlighted(key) ? "#22d3ee" : "rgba(255,255,255,0.05)"} 
              strokeWidth={isHighlighted(key) ? "1.5" : "0.5"} 
              className="transition-all duration-700 ease-in-out"
            />
            {isHighlighted(key) && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <circle cx={data.pos.x} cy={data.pos.y} r="2" fill="#22d3ee" />
                <line x1={data.pos.x} y1={data.pos.y} x2={data.pos.x > 50 ? data.pos.x + 10 : data.pos.x - 10} y2={data.pos.y} stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="2 2" />
                <text 
                  x={data.pos.x > 50 ? data.pos.x + 12 : data.pos.x - 12} 
                  y={data.pos.y + 2} 
                  fill="#22d3ee" 
                  fontSize="4" 
                  fontWeight="bold"
                  textAnchor={data.pos.x > 50 ? "start" : "end"}
                  className="font-mono uppercase tracking-tighter"
                >
                  {data.label}
                </text>
              </motion.g>
            )}
          </g>
        ))}
      </svg>
      
      {/* Scanning Ring Effect */}
      <div className="absolute inset-0 border border-cyan-500/10 rounded-full animate-[pulse_4s_infinite] pointer-events-none" />
      <div className="absolute inset-4 border border-cyan-500/5 rounded-full animate-[reverse-spin_10s_linear_infinite] pointer-events-none" />
    </div>
  );
};

export const Results: React.FC<ResultsProps> = ({ analysis, onReset }) => {
  const { t } = useLanguage();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20 shadow-[inset_0_0_20px_rgba(52,211,153,0.05)]';
      case 'fair': return 'text-amber-400 bg-amber-400/5 border-amber-400/20 shadow-[inset_0_0_20px_rgba(251,191,36,0.05)]';
      case 'attention_needed': return 'text-rose-400 bg-rose-400/5 border-rose-400/20 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]';
      default: return 'text-zinc-400 bg-zinc-400/5 border-zinc-400/20';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-emerald-400';
      case 'fair': return 'bg-amber-400';
      case 'attention_needed': return 'bg-rose-400';
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
      case 'optimal': return <CheckCircle2 className="w-5 h-5" />;
      case 'fair': return <Info className="w-5 h-5" />;
      case 'attention_needed': return <AlertCircle className="w-5 h-5" />;
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
        <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
          
          <div className="flex flex-col items-center">
            <FaceVisualization 
              affectedRegions={analysis.indicators.flatMap(i => i.affected_regions || [])} 
              indicators={analysis.indicators}
            />
            
            {/* Overall Score Circular Gauge */}
            <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * (analysis.overall_score || 0)) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn(
                    "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                    analysis.overall_score >= 80 ? "text-emerald-400" : analysis.overall_score >= 50 ? "text-amber-400" : "text-rose-400"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white tracking-tighter">{analysis.overall_score}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400">{t('Score')}</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                <HeartPulse className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{t('Analysis Complete')}</h2>
                <p className="text-cyan-400/80 text-xs font-mono uppercase tracking-widest">{t('AuraScan Biometric Report')}</p>
              </div>
            </div>
            <p className="text-zinc-300 text-base leading-relaxed italic font-light border-l-2 border-cyan-500/50 pl-4 py-1">
              "{analysis.summary}"
            </p>
          </div>
        </div>
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
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{t('Confidence')}</span>
                    <span className="text-xs font-mono text-cyan-400">{Math.round(indicator.confidence * 100)}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/20 backdrop-blur-sm">
                    {getIndicatorIcon(indicator.label, indicator.status)}
                  </div>
                </div>
              </div>
              
              {/* Facial Signs Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {indicator.facial_signs?.map((sign, i) => (
                  <span key={i} className="px-2 py-1 text-[10px] uppercase tracking-wider font-mono bg-black/30 text-zinc-300 rounded-md border border-white/5">
                    {sign}
                  </span>
                ))}
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-light">
                {indicator.systemic_implication}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-auto pt-4 border-t border-current/10">
              <div className="flex justify-between text-xs font-mono uppercase tracking-wider mb-2 opacity-70">
                <span>{t(indicator.status.replace('_', ' '))}</span>
                <span>{indicator.score}/100</span>
              </div>
              <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${indicator.score}%` }}
                  transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                  className={cn("h-full rounded-full", getProgressBarColor(indicator.status))}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 7-Day Challenge */}
      {analysis.challenge && (
        <div className="glass-panel rounded-[2.5rem] p-8 relative overflow-hidden border-cyan-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
                <div className="p-2 bg-cyan-500/20 rounded-xl">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
                {analysis.challenge.title}
              </h3>
              <p className="text-zinc-400 text-sm mt-2 max-w-xl">{analysis.challenge.description}</p>
            </div>
            <div className="px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono uppercase tracking-widest">
              {t('Action Plan')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysis.challenge.days.map((day, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-cyan-500/60 group-hover:text-cyan-400 transition-colors">{t('DAY')} {day.day}</span>
                  <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-cyan-500/50 transition-colors" />
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-light group-hover:text-white transition-colors">{day.task}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10 tracking-tight">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <ArrowRight className="w-5 h-5 text-cyan-400" />
          </div>
          {t('Personalized Recommendations')}
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
              <div className="flex flex-col">
                <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">{rec.category}</span>
                <p className="text-zinc-300 leading-relaxed font-light">{rec.tip}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
        <div className="flex items-center gap-3 mb-2 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wider">{t('Medical Disclaimer')}</span>
        </div>
        <p className="text-rose-400/80 text-xs leading-relaxed">
          {analysis.disclaimer} {t('AuraScan is an AI-powered wellness tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.')}
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
            {t('Scan Again')}
          </span>
        </button>
      </div>
    </motion.div>
  );
};
