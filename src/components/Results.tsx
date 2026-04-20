import React, { useState } from 'react';
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
  Beaker,
  Apple,
  Dumbbell,
  Brain,
  Coffee,
  Utensils,
  ShoppingBag,
  ExternalLink,
  Lock,
  Download,
  ShoppingCart,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { HealthAnalysis } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

interface ResultsProps {
  analysis: HealthAnalysis;
  onReset: () => void;
  onUpdateChallenge?: (scanId: string, dayIndex: number, completed: boolean) => void;
  activeChallengeScanId?: string | null;
  scanHistory?: (HealthAnalysis & { id: string })[];
  onSetActiveChallenge?: (id: string) => void;
  currentScanId?: string | null;
}

export const Results: React.FC<ResultsProps> = ({ 
  analysis, 
  onReset, 
  onUpdateChallenge,
  activeChallengeScanId,
  scanHistory,
  onSetActiveChallenge,
  currentScanId
}) => {
  const { t, language: currentLanguage } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<typeof analysis.products extends (infer T)[] ? T : never | null>(null);
  const [showScience, setShowScience] = useState(false);
  const isTranslating = analysis.language && analysis.language !== currentLanguage;

  const handleExport = () => {
    window.print();
  };
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-[var(--accent-teal)] bg-[var(--accent-teal-soft)] border-[var(--accent-teal-border)] shadow-[0_0_20px_rgba(45,212,191,0.1)]';
      case 'fair': return 'text-[var(--accent-amber)] bg-[var(--accent-amber-soft)] border-[var(--accent-amber-border)] shadow-[0_0_20px_rgba(251,191,36,0.1)]';
      case 'attention_needed': return 'text-[var(--accent-pink)] bg-[var(--accent-pink-soft)] border-[var(--accent-pink-border)] shadow-[0_0_20px_rgba(244,114,182,0.1)]';
      default: return 'text-[var(--text-secondary)] bg-[var(--bg-card-hover)] border-[var(--border-color)]';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-[var(--accent-teal)] shadow-[0_0_10px_rgba(45,212,191,0.5)]';
      case 'fair': return 'bg-[var(--accent-amber)] shadow-[0_0_10px_rgba(251,191,36,0.5)]';
      case 'attention_needed': return 'bg-[var(--accent-pink)] shadow-[0_0_10px_rgba(244,114,182,0.5)]';
      default: return 'bg-slate-600';
    }
  };

  const getIndicatorIcon = (label: string, status: string) => {
    const lowerLabel = (label || '').toLowerCase();
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

  const getRecommendationIcon = (category: string) => {
    const lowerCategory = (category || '').toLowerCase();
    if (lowerCategory.includes('nutrition') || lowerCategory.includes('diet') || lowerCategory.includes('food')) return <Apple className="w-5 h-5 text-emerald-400" />;
    if (lowerCategory.includes('hydration') || lowerCategory.includes('water')) return <Droplets className="w-5 h-5 text-blue-400" />;
    if (lowerCategory.includes('sleep') || lowerCategory.includes('rest')) return <Moon className="w-5 h-5 text-indigo-400" />;
    if (lowerCategory.includes('exercise') || lowerCategory.includes('activity') || lowerCategory.includes('fitness')) return <Dumbbell className="w-5 h-5 text-orange-400" />;
    if (lowerCategory.includes('stress') || lowerCategory.includes('mindfulness') || lowerCategory.includes('mental')) return <Brain className="w-5 h-5 text-purple-400" />;
    if (lowerCategory.includes('skincare') || lowerCategory.includes('skin')) return <Sparkles className="w-5 h-5 text-cyan-400" />;
    if (lowerCategory.includes('lifestyle') || lowerCategory.includes('habit')) return <Sun className="w-5 h-5 text-amber-400" />;
    return <Zap className="w-5 h-5 text-cyan-400" />;
  };

  const radarData = (analysis.indicators || []).map(ind => ({
    subject: (ind.label || '').split(' ')[0], // Shorten label for radar chart
    score: ind.score || 0,
    fullMark: 100,
  }));

  const lowConfidence = (analysis.indicators || []).some(ind => (ind.confidence || 1) < 0.7);

  // Component for Facial Mapping
  const BiometricMap = ({ indicators }: { indicators: HealthAnalysis['indicators'] }) => {
    const regions = {
      forehead: { path: "M 40,25 Q 50,15 60,25 Q 60,35 50,35 Q 40,35 40,25 Z", label: "Forehead" },
      eyes: { path: "M 35,45 Q 42,40 48,45 Q 48,50 42,50 Q 35,50 35,45 Z M 52,45 Q 58,40 65,45 Q 65,50 58,50 Q 52,50 52,45 Z", label: "Periorbital" },
      nose: { path: "M 48,45 L 52,45 L 53,60 L 47,60 Z", label: "Nasal" },
      cheeks: { path: "M 30,60 Q 35,55 45,60 M 70,60 Q 65,55 55,60", label: "Malar" },
      mouth: { path: "M 42,75 Q 50,70 58,75 Q 58,82 50,82 Q 42,82 42,75 Z", label: "Oral" },
      jawline: { path: "M 25,60 Q 25,90 50,95 Q 75,90 75,60", label: "Mandibular" }
    };

    const getRegionStatus = (region: string) => {
      const match = indicators.find(i => i.affected_regions?.includes(region as any));
      return match ? match.status : null;
    };

    const getRegionColor = (status: string | null) => {
      if (!status) return "stroke-white/10 fill-transparent";
      if (status === 'optimal') return "stroke-[var(--accent-teal)] fill-[var(--accent-teal)]/20";
      if (status === 'fair') return "stroke-[var(--accent-amber)] fill-[var(--accent-amber)]/20";
      return "stroke-[var(--accent-pink)] fill-[var(--accent-pink)]/20";
    };

    return (
      <div className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center p-4">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(45,212,191,0.15)]">
          {/* Main Face Contour (Subtle Background) */}
          <path 
            d="M 50,5 Q 85,5 85,45 Q 85,85 50,95 Q 15,85 15,45 Q 15,5 50,5 Z" 
            fill="none" 
            stroke="currentColor" 
            className="text-[var(--border-color)] opacity-40"
            strokeWidth="0.5"
          />
          
          {/* Facial Regions Mapping */}
          {Object.entries(regions).map(([id, reg]) => {
            const status = getRegionStatus(id);
            return (
              <motion.path
                key={id}
                d={reg.path}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn("transition-all duration-700", getRegionColor(status))}
                strokeWidth={status ? "1" : "0.5"}
                strokeDasharray={status ? "none" : "2,2"}
              />
            );
          })}

          {/* Biometric Scan Indicators */}
          <motion.circle 
            animate={{ r: [1.5, 2.5, 1.5], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            cx="50" cy="50" r="2" fill="var(--accent-teal)" 
          />
        </svg>
        
        {/* Animated Scanning Ring */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 border border-[var(--accent-teal)]/20 rounded-full"
        />
        
        {/* Summary Label Overlay */}
        <div className="absolute -top-4 -right-4 md:-top-8 md:-right-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3 shadow-xl backdrop-blur-md">
           <div className="flex flex-col items-end gap-1">
             <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)]">{t('Facial Zones Analyzed')}</span>
             <span className="text-sm font-bold text-[var(--accent-teal)]">6/6 {t('Mapped')}</span>
           </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto space-y-8 md:space-y-16 pb-12 md:pb-24"
    >
      {lowConfidence && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-4 mx-4 md:mx-0"
        >
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-amber-600 dark:text-amber-200 font-medium text-sm mb-1">{t('Low Confidence Analysis')}</h4>
            <p className="text-amber-600/70 dark:text-amber-400/70 text-xs leading-relaxed">
              {t('The AI encountered some difficulty analyzing certain facial markers. For 100% accuracy, ensure you are in a brightly lit environment, remove glasses, and position your face clearly within the guide.')}
            </p>
          </div>
        </motion.div>
      )}

      {/* Hero Header: Visual Dashboard */}
      <div className="relative pt-8 md:pt-12 pb-8 md:pb-12 px-4 md:px-0 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full pointer-events-none opacity-40">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-[var(--accent-teal)] via-sky-500 to-[var(--accent-pink)] blur-[120px] rounded-full" 
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side: Score & Vitality */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-teal-soft)] border border-[var(--accent-teal-border)] text-[var(--accent-teal)] text-[10px] font-mono tracking-[0.3em] uppercase shadow-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] animate-pulse" />
                {t('BIOMETRIC REPORT GENERATED')}
              </div>
              <h2 className="text-5xl md:text-7xl font-display font-black text-[var(--text-primary)] tracking-tighter leading-[0.9]">
                {t('AURA')}<span className="text-[var(--accent-teal)]">{t('STATUS')}</span>
              </h2>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                 <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] px-4 py-2 rounded-2xl shadow-xl">
                   <HeartPulse className="w-4 h-4 text-[var(--accent-teal)]" />
                   <div className="flex flex-col items-start leading-none">
                     <span className="text-[8px] font-mono uppercase text-[var(--text-secondary)]">{t('Vitality Level')}</span>
                     <span className="text-sm font-bold text-[var(--text-primary)]">{analysis.overall_score}%</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] px-4 py-2 rounded-2xl shadow-xl">
                   <Activity className="w-4 h-4 text-[var(--accent-pink)]" />
                   <div className="flex flex-col items-start leading-none">
                     <span className="text-[8px] font-mono uppercase text-[var(--text-secondary)]">{t('Confidence Score')}</span>
                     <span className="text-sm font-bold text-[var(--text-primary)]">
                       {Math.round((analysis.indicators.reduce((acc, curr) => acc + curr.confidence, 0) / analysis.indicators.length) * 100)}%
                     </span>
                   </div>
                 </div>
              </div>
            </motion.div>

            {/* Vitality Orb Visual */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              <div className="absolute inset-0 border border-[var(--border-color)] rounded-full opacity-20" />
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-8 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] rounded-full border-2 border-[var(--accent-teal-border)] flex items-center justify-center overflow-hidden shadow-2xl"
              >
                <motion.div 
                  animate={{ y: [100 - analysis.overall_score + 5, 100 - analysis.overall_score - 5, 100 - analysis.overall_score + 5] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-t from-[var(--accent-teal)]/20 to-transparent"
                />
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-7xl md:text-8xl font-display font-black text-[var(--text-primary)] tracking-tighter">
                    {analysis.overall_score}
                  </span>
                  <div className="text-[10px] font-mono font-bold text-[var(--accent-teal)] uppercase tracking-[0.3em]">{t('SCORE')}</div>
                </div>
              </motion.div>

              {/* Enhanced Radar Chart Visual */}
              <div className="absolute inset-0 opacity-40 group-hover:opacity-80 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="85%" data={radarData}>
                    <PolarGrid stroke="currentColor" className="text-[var(--border-color)] opacity-20" />
                    <PolarAngleAxis dataKey="subject" tick={false} />
                    <Radar dataKey="score" stroke="var(--accent-teal)" fill="var(--accent-teal)" fillOpacity={0.1} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Side: Biometric Visual Mapping */}
          <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
             <div className="grid grid-cols-2 gap-4">
                {/* Visual Face Map */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-teal)]/5 blur-[40px] rounded-full" />
                  <div className="relative z-10 h-full flex flex-col items-center">
                    <BiometricMap indicators={analysis.indicators} />
                    <span className="mt-4 text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)]">{t('Regional Scan Summary')}</span>
                  </div>
                </div>

                {/* Performance Radar Cell */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group flex flex-col items-center justify-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-pink)]/5 blur-[40px] rounded-full" />
                  <div className="w-full h-full min-h-[140px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                        <PolarGrid stroke="currentColor" className="text-[var(--border-color)] opacity-40" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 7, fontWeight: 'bold' }} />
                        <Radar dataKey="score" stroke="var(--accent-pink)" fill="var(--accent-pink)" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                   <span className="mt-2 text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)]">{t('Systemic Balance')}</span>
                </div>
             </div>

             {/* Summary Text Panel */}
             <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group text-left">
                <div className="flex items-center gap-2 mb-4">
                   <div className="p-1.5 bg-[var(--accent-teal-soft)] rounded-lg">
                      <Brain className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                   </div>
                   <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)] font-bold">{t('Aura Intelligence Summary')}</span>
                </div>
                <div className="markdown-body text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-light italic">
                  <Markdown
                    components={{
                      p: ({ children }) => <p className="mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-bold text-[var(--text-primary)] neon-text-teal">{children}</strong>,
                    }}
                  >
                    {analysis.summary}
                  </Markdown>
                </div>
                
                {/* Science Trigger Button integrated into dashboard */}
                <button
                  onClick={() => setShowScience(true)}
                  className="mt-6 flex items-center gap-2 px-4 py-2 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl shadow-lg hover:border-[var(--accent-teal-border)] transition-all group/btn w-fit"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-[var(--accent-teal)] group-hover/btn:rotate-12 transition-transform" />
                  <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] group-hover/btn:text-[var(--accent-teal)] uppercase tracking-widest">
                    {t('Verify Science')}
                  </span>
                </button>
             </div>
          </div>
        </div>

        {/* Visual Quick-Scan Row (Vitality Gauges) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {[
              { 
                label: t('Hydration & Dermal'), 
                val: analysis.indicators.find(i => i.affected_regions?.includes('skin_overall'))?.score || 75,
                icon: Droplets, color: 'var(--accent-teal)'
              },
              { 
                label: t('Stress & Nervous'), 
                val: analysis.indicators.find(i => i.affected_regions?.includes('mouth') || i.affected_regions?.includes('eyes'))?.score || 82,
                icon: Brain, color: 'var(--accent-pink)'
              },
              { 
                label: t('Systemic Stability'), 
                val: analysis.overall_score,
                icon: ShieldAlert, color: 'var(--accent-amber)'
              }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-[1.5rem] shadow-xl flex items-center gap-4 group"
              >
                <div className="p-3 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] group-hover:border-[var(--accent-teal-border)] transition-colors">
                  <stat.icon className="w-5 h-5 text-[var(--text-primary)]" style={{ color: stat.color }} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)]">{stat.label}</span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">{stat.val}%</span>
                  </div>
                  <div className="h-1 bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.val}%` }}
                      style={{ backgroundColor: stat.color }}
                      className="h-full rounded-full opacity-60"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Quick Visual Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--accent-teal-soft)] border border-[var(--accent-teal-border)] p-6 rounded-[2.5rem] flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-teal)]/10 blur-[40px] rounded-full rotate-45" />
          <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] flex items-center justify-center border border-[var(--accent-teal-border)] shadow-xl relative z-10">
            <Zap className="w-8 h-8 text-[var(--accent-teal)]" />
          </div>
          <div className="space-y-1 relative z-10 text-left">
            <h4 className="text-[var(--accent-teal)] font-mono text-[10px] uppercase tracking-[0.3em] font-bold">{t('Strongest Index')}</h4>
            <div className="text-xl font-display font-black text-[var(--text-primary)]">
              {analysis.indicators.sort((a,b) => b.score - a.score)[0]?.label}
            </div>
          </div>
        </div>
        <div className="bg-[var(--accent-pink-soft)] border border-[var(--accent-pink-border)] p-6 rounded-[2.5rem] flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-pink)]/10 blur-[40px] rounded-full rotate-45" />
          <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] flex items-center justify-center border border-[var(--accent-pink-border)] shadow-xl relative z-10">
            <AlertCircle className="w-8 h-8 text-[var(--accent-pink)]" />
          </div>
          <div className="space-y-1 relative z-10 text-left">
            <h4 className="text-[var(--accent-pink)] font-mono text-[10px] uppercase tracking-[0.3em] font-bold">{t('Primary Focus Area')}</h4>
            <div className="text-xl font-display font-black text-[var(--text-primary)]">
              {analysis.indicators.sort((a,b) => a.score - b.score)[0]?.label}
            </div>
          </div>
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {(analysis.indicators || []).map((indicator, idx) => (
          <motion.div
            key={indicator.label || idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "p-5 md:p-6 rounded-3xl border transition-all duration-300 hover:shadow-md flex flex-col justify-between",
              getStatusColor(indicator.status || 'unknown')
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-bold text-xl tracking-tight text-[var(--text-primary)]">{indicator.label}</span>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">{t('Confidence')}</span>
                    <span className="text-xs font-mono text-[var(--accent-teal)]">{Math.round((indicator.confidence || 0) * 100)}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-color)]">
                    {getIndicatorIcon(indicator.label, indicator.status)}
                  </div>
                </div>
              </div>
              
              {/* Facial Signs Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(indicator.facial_signs || []).map((sign, i) => (
                  <span key={i} className="px-2 py-1 text-[9px] uppercase tracking-[0.2em] font-mono bg-[var(--bg-card-hover)] text-[var(--text-secondary)] rounded-md border border-[var(--border-color)]">
                    {sign}
                  </span>
                ))}
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 font-light">
                {indicator.systemic_implication}
              </p>

              {/* Professional Insight Box */}
              {indicator.technical_insight && (
                <div className="mb-6 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] group-hover:border-[var(--accent-teal-border)] transition-all flex flex-col gap-2">
                  <div className="flex items-center gap-2 opacity-50">
                    <Stethoscope className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">{t('Biometric Marker')}</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] font-mono italic leading-relaxed">
                    {indicator.technical_insight}
                  </p>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-auto pt-4 border-t border-[var(--border-color)]">
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.2em] mb-2 opacity-70">
                <span>{t((indicator.status || 'unknown').replace('_', ' '))}</span>
                <span className="text-[var(--text-primary)]">{indicator.score || 0}/100</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${indicator.score || 0}%` }}
                  transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                  className={cn("h-full rounded-full", getProgressBarColor(indicator.status || 'unknown'))}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 7-Day Challenge Section */}
      {(() => {
        const activeChallengeScan = scanHistory?.find(s => (s as any).id === activeChallengeScanId) || (currentScanId === activeChallengeScanId ? analysis : null);
        const hasActiveAndDifferent = activeChallengeScanId && activeChallengeScanId !== currentScanId;
        const currentChallenge = analysis.challenge || { title: 'Wellness Quest', description: 'Personalized quest loading...', days: [] };
        
        // Decide which challenge to display primarily
        const displayChallenge = activeChallengeScan ? (activeChallengeScan.challenge || currentChallenge) : currentChallenge;
        const displayScanId = activeChallengeScan ? (activeChallengeScan as any).id || currentScanId : currentScanId;

        return (
          <div className="space-y-6">
            {/* Ongoing Quest Awareness */}
            {hasActiveAndDifferent && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[var(--accent-pink-soft)] border border-[var(--accent-pink-border)] rounded-2xl gap-4">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-[var(--accent-pink)] animate-pulse" />
                  <span className="text-xs font-medium text-[var(--text-primary)]">
                    {t('You have an ongoing 7-day challenge from a previous scan.')}
                  </span>
                </div>
                <button 
                  onClick={() => onSetActiveChallenge && onSetActiveChallenge(currentScanId || '')}
                  className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--accent-pink-border)] text-[var(--accent-pink)] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[var(--accent-pink-soft)] transition-all"
                >
                  {t('Switch to New Quest')}
                </button>
              </div>
            )}

            <div className="medical-card p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[var(--accent-teal-soft)] rounded-xl border border-[var(--accent-teal-border)]">
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[var(--accent-teal)]" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--accent-teal)] font-bold">
                      {activeChallengeScanId === currentScanId || !activeChallengeScanId ? t('Today\'s Recommendation') : t('Current Active Program')}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">
                    {displayChallenge.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-xl font-light">{displayChallenge.description}</p>
                </div>
                
                {/* Progress Tracker */}
                <div className="flex flex-col items-end gap-2 bg-[var(--bg-card-hover)] p-4 rounded-2xl border border-[var(--border-color)] w-full md:w-auto">
                  <div className="flex justify-between w-full items-center gap-4">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)]">{t('Overall Progress')}</span>
                    <span className="text-sm font-bold text-[var(--accent-teal)]">
                      {(displayChallenge.days || []).filter(d => d.completed).length} / 7
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {(displayChallenge.days || []).map((day, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "h-1.5 w-5 rounded-full transition-all duration-500",
                          day.completed ? "bg-[var(--accent-teal)] shadow-[0_0_8px_rgba(45,212,191,0.5)]" : "bg-[var(--border-color)]"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {(displayChallenge.days || []).map((day, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.05 }}
                    onClick={() => onUpdateChallenge && onUpdateChallenge(displayScanId || '', idx, !day.completed)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all group cursor-pointer relative overflow-hidden",
                      day.completed 
                        ? "bg-[var(--accent-teal-soft)] border-[var(--accent-teal-border)] shadow-xl" 
                        : "bg-[var(--bg-card-hover)] border-[var(--border-color)] hover:border-[var(--accent-teal-border)]"
                    )}
                  >
                    {day.completed && (
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-teal-500/20 rounded-full blur-xl pointer-events-none" />
                    )}
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className={cn(
                        "text-[10px] font-mono transition-colors tracking-[0.2em]",
                        day.completed ? "text-[var(--accent-teal)] font-bold" : "text-[var(--text-secondary)] group-hover:text-[var(--accent-teal)]"
                      )}>
                        {t('DAY')} 0{day.day}
                      </span>
                      <div className={cn(
                        "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                        day.completed 
                          ? "bg-[var(--accent-teal)] border-[var(--accent-teal)] text-[var(--bg-card)]" 
                          : "border-[var(--border-color)] group-hover:border-[var(--accent-teal)] bg-[var(--bg-card)]"
                      )}>
                        {day.completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[var(--accent-teal)] transition-colors" />
                        )}
                      </div>
                    </div>
                    <p className={cn(
                      "text-sm leading-relaxed transition-colors relative z-10",
                      day.completed ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)] font-light group-hover:text-[var(--text-primary)]"
                    )}>
                      {day.task}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Recommendations */}
      <div className="medical-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none" />
        <h3 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] mb-6 md:mb-8 flex items-center gap-3 relative z-10 tracking-tight">
          <div className="p-2 bg-[var(--accent-teal-soft)] rounded-lg border border-[var(--accent-teal-border)]">
            <ArrowRight className="w-5 h-5 text-[var(--accent-teal)]" />
          </div>
          {t('Personalized Recommendations')}
        </h3>
        <div className="space-y-3 md:space-y-4 relative z-10">
          {(analysis.recommendations || []).length > 0 ? (
            (analysis.recommendations || []).map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
                className="flex items-start gap-3 md:gap-5 p-5 md:p-6 bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border-color)] hover:bg-[var(--bg-card)] hover:border-[var(--accent-teal-border)] transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xl group-hover:border-[var(--accent-teal-border)] transition-all">
                  {getRecommendationIcon(rec.category)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[var(--accent-teal)] text-[10px] font-mono uppercase tracking-[0.2em] mb-1.5">{rec.category}</span>
                  <p className="text-[var(--text-secondary)] leading-relaxed font-light text-base">{rec.tip}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border-color)]">
              <p className="text-[var(--text-secondary)] font-light">{t('No specific recommendations found for this scan. Continue maintaining your healthy habits!')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Business Integration: Products & Meals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Recommended Products */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="medical-card p-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[var(--accent-teal)]" />
              {t('Recommended products for you')}
            </h3>
          </div>

          <div className="space-y-4">
            {analysis.products?.map((product, idx) => (
              <div key={idx} className="bg-[var(--bg-card-hover)] rounded-3xl border border-[var(--border-color)] overflow-hidden group hover:border-[var(--accent-teal-border)] transition-all hover:shadow-2xl">
                <div className="h-40 w-full relative overflow-hidden">
                  <img 
                    src={`https://loremflickr.com/600/400/${encodeURIComponent((product.type || 'wellness').toLowerCase())},product/all?lock=${(product.name || '').length + idx}`} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card-hover)] via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 bg-[var(--bg-card)]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--border-color)]">
                     <span className="text-[10px] font-mono text-[var(--accent-teal)] uppercase tracking-widest">{product.brand || t('Aura Select')}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-bold text-[var(--text-primary)] text-xl tracking-tight leading-tight">{product.name}</h4>
                    {product.price && (
                      <span className="text-sm font-mono font-bold text-[var(--accent-teal)] bg-[var(--accent-teal-soft)] px-2 py-0.5 rounded-lg border border-[var(--accent-teal-border)]">
                        {product.price}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed font-light line-clamp-2">{product.reason}</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="flex-1 px-4 py-3 bg-[var(--text-primary)] text-[var(--bg-card)] text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl"
                    >
                      <Info className="w-4 h-4" />
                      {t('View Product')}
                    </button>
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(product.name)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl hover:border-[var(--accent-teal-border)] transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Personalized Nutrition */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="medical-card p-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] flex items-center gap-3">
              <Utensils className="w-5 h-5 text-sky-500" />
              {t('Personalized Nutrition')}
            </h3>
          </div>

          <div className="space-y-6">
            {analysis.meals?.map((meal, idx) => (
              <div key={idx} className="bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border-color)] overflow-hidden group hover:border-[var(--accent-teal-border)] transition-all shadow-xl">
                <div className="h-44 w-full relative overflow-hidden">
                  <img 
                    src={`https://loremflickr.com/600/400/${encodeURIComponent((meal.image_keyword || meal.title || 'food').replace(/-/g, ','))}/all?lock=${(meal.title || '').length + idx}`} 
                    alt={meal.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <h4 className="text-white font-bold text-xl leading-tight tracking-tight drop-shadow-md">{meal.title}</h4>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed font-light">{meal.description}</p>
                  
                  {/* Nutritional Info */}
                  {meal.nutritional_info && (
                    <div className="grid grid-cols-4 gap-3 mb-5">
                      <div className="bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)] text-center">
                        <span className="block text-[9px] text-[var(--text-secondary)] uppercase font-mono tracking-widest">{t('CAL')}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{meal.nutritional_info.calories || 0}</span>
                      </div>
                      <div className="bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)] text-center">
                        <span className="block text-[9px] text-[var(--text-secondary)] uppercase font-mono tracking-widest">{t('PRO')}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{meal.nutritional_info.protein || '0g'}</span>
                      </div>
                      <div className="bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)] text-center">
                        <span className="block text-[9px] text-[var(--text-secondary)] uppercase font-mono tracking-widest">{t('CARB')}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{meal.nutritional_info.carbs || '0g'}</span>
                      </div>
                      <div className="bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)] text-center">
                        <span className="block text-[9px] text-[var(--text-secondary)] uppercase font-mono tracking-widest">{t('FAT')}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{meal.nutritional_info.fats || '0g'}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {(meal.ingredients || []).map((ing, i) => (
                      <span key={i} className="text-[10px] bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-1 rounded-lg text-[var(--text-secondary)] font-mono tracking-wider">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Disclaimer */}
      <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
        <div className="flex items-center gap-3 mb-2 text-rose-500">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-[0.2em] font-mono">{t('Medical Disclaimer')}</span>
        </div>
        <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-light">
          {analysis.disclaimer} {t('AuraScan is an AI-powered wellness tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.')}
        </p>
      </div>

      {/* Action */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 md:pt-8 pb-8 md:pb-12">
        <button
          onClick={handleExport}
          className="group relative px-8 md:px-10 py-3 md:py-4 bg-[var(--bg-card)] border-2 border-[var(--border-color)] text-[var(--text-primary)] font-bold rounded-full overflow-hidden transition-all hover:border-[var(--accent-teal-border)] active:scale-95 shadow-2xl w-full sm:w-auto"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <Download className="w-5 h-5" />
            {t('Export Report')}
          </span>
        </button>
        <button
          onClick={onReset}
          className="group relative px-8 md:px-10 py-3 md:py-4 bg-[var(--text-primary)] text-[var(--bg-card)] font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl w-full sm:w-auto"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            {t('Scan Again')}
          </span>
        </button>
      </div>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-[var(--bg-main)]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-[var(--accent-teal-soft)] rounded-2xl border border-[var(--accent-teal-border)]">
                    <ShoppingBag className="w-8 h-8 text-[var(--accent-teal)]" />
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 hover:bg-[var(--bg-card-hover)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--accent-teal)] uppercase tracking-[0.3em] mb-2 block">
                      {selectedProduct.brand || t('Premium Recommendation')}
                    </span>
                    <h3 className="text-3xl font-display font-bold text-[var(--text-primary)] leading-tight">
                      {selectedProduct.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                      {selectedProduct.type === 'SKINCARE' ? t('Skincare Solution') : t('Wellness Supplement')}
                    </span>
                  </div>

                  <div className="p-6 bg-[var(--bg-card-hover)] rounded-3xl border border-[var(--border-color)]">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3">
                      {t('Why it was selected')}
                    </h4>
                    <p className="text-[var(--text-secondary)] leading-relaxed font-light">
                      {selectedProduct.reason}
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(selectedProduct.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-card)] font-bold rounded-full flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                      <ExternalLink className="w-5 h-5" />
                      {t('get it')}
                    </a>
                    <a
                      href={selectedProduct.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-4 bg-[var(--bg-card-hover)] border-2 border-[var(--border-color)] text-[var(--text-secondary)] font-bold rounded-full flex items-center justify-center hover:bg-[var(--bg-card)] transition-all"
                      title={t('External Link')}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Science & Methodology Modal */}
      <AnimatePresence>
        {showScience && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScience(false)}
              className="absolute inset-0 bg-[var(--bg-main)]/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[var(--accent-teal-soft)] border border-[var(--accent-teal-border)] rounded-full w-fit">
                      <Stethoscope className="w-3 h-3 text-[var(--accent-teal)]" />
                      <span className="text-[10px] font-mono font-bold text-[var(--accent-teal)] uppercase tracking-widest">{t('Clinical Intelligence')}</span>
                    </div>
                    <h3 className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">
                      {t('Science & Methodology')}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowScience(false)}
                    className="p-3 hover:bg-[var(--bg-card-hover)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Landmark Tracking */}
                  <div className="space-y-3 p-6 rounded-3xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] group hover:border-[var(--accent-teal-border)] transition-all">
                    <div className="p-2 w-fit bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                      <Activity className="w-5 h-5 text-[var(--accent-teal)]" />
                    </div>
                    <h4 className="font-bold text-[var(--text-primary)] tracking-tight">{t('Facial Mapping')}</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                      {t('Our AI identifies 468+ biometric landmarks to assess micro-expressions and skin markers.')}
                    </p>
                  </div>

                  {/* Vascular Analysis */}
                  <div className="space-y-3 p-6 rounded-3xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] group hover:border-[var(--accent-pink-border)] transition-all">
                    <div className="p-2 w-fit bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                      <HeartPulse className="w-5 h-5 text-[var(--accent-pink)]" />
                    </div>
                    <h4 className="font-bold text-[var(--text-primary)] tracking-tight">{t('Vascular Vitality')}</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                      {t('Our system analyzes capillary density and oxygenation markers in the mucosal and dermal layers.')}
                    </p>
                  </div>

                  {/* Systemic Mapping */}
                  <div className="space-y-3 p-6 rounded-3xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] group hover:border-[var(--accent-amber-border)] transition-all">
                    <div className="p-2 w-fit bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                      <Sparkles className="w-5 h-5 text-[var(--accent-amber)]" />
                    </div>
                    <h4 className="font-bold text-[var(--text-primary)] tracking-tight">{t('Dermal Mapping')}</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                      {t('We map systemic health to specific facial zones based on known dermatological correlations.')}
                    </p>
                  </div>

                  {/* Trust Shield */}
                  <div className="space-y-3 p-6 rounded-3xl bg-[var(--accent-teal-soft)] border border-[var(--accent-teal-border)] transition-all shadow-lg">
                    <div className="p-2 w-fit bg-[var(--bg-card)] rounded-xl border border-[var(--accent-teal-border)]">
                      <ShieldAlert className="w-5 h-5 text-[var(--accent-teal)]" />
                    </div>
                    <h4 className="font-bold text-[var(--text-primary)] tracking-tight">{t('AI Reliability')}</h4>
                    <p className="text-xs text-[var(--text-primary)]/80 leading-relaxed font-medium italic">
                      {t('Each scan includes a confidence score. Higher lighting and clear visibility yield 99.8% measurement consistency.')}
                    </p>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-[var(--border-color)] flex justify-between items-center text-[var(--text-secondary)]">
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-[var(--accent-teal)] animate-pulse" />
                     <span className="text-[10px] font-mono uppercase tracking-widest">{t('Engine Ver: 2.4.0')}</span>
                   </div>
                   <span className="text-[10px] font-mono">{t('Verified by Aura Bio-Logic')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
