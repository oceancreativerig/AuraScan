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
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { HealthAnalysis } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

interface ResultsProps {
  analysis: HealthAnalysis;
  onReset: () => void;
  onUpdateChallenge?: (dayIndex: number, completed: boolean) => void;
}

export const Results: React.FC<ResultsProps> = ({ analysis, onReset, onUpdateChallenge }) => {
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<typeof analysis.products extends (infer T)[] ? T : never | null>(null);

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

  const radarData = analysis.indicators.map(ind => ({
    subject: (ind.label || '').split(' ')[0], // Shorten label for radar chart
    score: ind.score,
    fullMark: 100,
  }));

  const lowConfidence = analysis.indicators.some(ind => (ind.confidence || 1) < 0.7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6 md:space-y-8 pb-10 md:pb-20"
    >
      {lowConfidence && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-4"
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

      {/* Header Summary */}
      <div className="medical-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center relative z-10">
          
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="currentColor" className="text-[var(--border-color)]" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} className="text-[var(--text-secondary)]" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#2dd4bf"
                    strokeWidth={2}
                    fill="#2dd4bf"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Overall Score Circular Gauge */}
            <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0 flex items-center justify-center -mt-8 md:-mt-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-[var(--bg-card-hover)]" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * (analysis.overall_score || 0)) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn(
                    "drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]",
                    analysis.overall_score >= 80 ? "text-teal-500" : analysis.overall_score >= 50 ? "text-amber-500" : "text-rose-500"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-[var(--text-primary)] tracking-tighter">{analysis.overall_score}</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)]">{t('Score')}</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[var(--accent-teal-soft)] rounded-xl border border-[var(--accent-teal-border)]">
                <HeartPulse className="w-6 h-6 text-[var(--accent-teal)]" />
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">{t('Analysis Complete')}</h2>
                <p className="text-[var(--accent-teal)] text-[10px] font-mono uppercase tracking-[0.3em]">{t('AuraScan Biometric Report')}</p>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed italic font-light border-l-2 border-[var(--accent-teal-border)] pl-6 py-2">
              "{analysis.summary}"
            </p>
          </div>
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {analysis.indicators.map((indicator, idx) => (
          <motion.div
            key={indicator.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "p-5 md:p-6 rounded-3xl border transition-all duration-300 hover:shadow-md flex flex-col justify-between",
              getStatusColor(indicator.status)
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-bold text-xl tracking-tight text-[var(--text-primary)]">{indicator.label}</span>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">{t('Confidence')}</span>
                    <span className="text-xs font-mono text-[var(--accent-teal)]">{Math.round(indicator.confidence * 100)}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-color)]">
                    {getIndicatorIcon(indicator.label, indicator.status)}
                  </div>
                </div>
              </div>
              
              {/* Facial Signs Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {indicator.facial_signs?.map((sign, i) => (
                  <span key={i} className="px-2 py-1 text-[9px] uppercase tracking-[0.2em] font-mono bg-[var(--bg-card-hover)] text-[var(--text-secondary)] rounded-md border border-[var(--border-color)]">
                    {sign}
                  </span>
                ))}
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 font-light">
                {indicator.systemic_implication}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-auto pt-4 border-t border-[var(--border-color)]">
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.2em] mb-2 opacity-70">
                <span>{t(indicator.status.replace('_', ' '))}</span>
                <span className="text-[var(--text-primary)]">{indicator.score}/100</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
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
        <div className="medical-card p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] flex items-center gap-3 tracking-tight">
                <div className="p-2 bg-[var(--accent-teal-soft)] rounded-xl border border-[var(--accent-teal-border)]">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[var(--accent-teal)]" />
                </div>
                {analysis.challenge.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-xl font-light">{analysis.challenge.description}</p>
            </div>
            
            {/* Progress Tracker */}
            <div className="flex flex-col items-end gap-2 bg-[var(--bg-card-hover)] p-4 rounded-2xl border border-[var(--border-color)] w-full md:w-auto">
              <div className="flex justify-between w-full items-center gap-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)]">{t('Progress')}</span>
                <span className="text-sm font-bold text-[var(--accent-teal)]">
                  {analysis.challenge?.days?.filter(d => d.completed).length || 0} / 7
                </span>
              </div>
              <div className="flex gap-1.5">
                {analysis.challenge?.days?.map((day, idx) => (
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
            {analysis.challenge?.days?.map((day, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                onClick={() => onUpdateChallenge && onUpdateChallenge(idx, !day.completed)}
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
      )}

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
          {analysis.recommendations.length > 0 ? (
            analysis.recommendations.map((rec, idx) => (
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
              <div key={idx} className="p-6 bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border-color)] group hover:border-[var(--accent-teal-border)] transition-all hover:shadow-2xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--accent-teal)] uppercase tracking-[0.3em] mb-1.5 block">{product.brand || t('Premium Choice')}</span>
                    <h4 className="font-bold text-[var(--text-primary)] text-xl tracking-tight">{product.name}</h4>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed font-light">{product.reason}</p>
                <div className="flex gap-3">
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(product.name)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-[var(--text-primary)] text-[var(--bg-card)] text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('get it')}
                  </a>
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="px-4 py-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--bg-card)] transition-all"
                  >
                    {t('Details')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
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
                    src={`https://loremflickr.com/600/400/${encodeURIComponent((meal.image_keyword || meal.title || 'food').replace(/-/g, ','))}/all?lock=${meal.title.length + idx}`} 
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
                        <span className="text-xs font-bold text-[var(--text-primary)]">{meal.nutritional_info.calories}</span>
                      </div>
                      <div className="bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)] text-center">
                        <span className="block text-[9px] text-[var(--text-secondary)] uppercase font-mono tracking-widest">{t('PRO')}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{meal.nutritional_info.protein}</span>
                      </div>
                      <div className="bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)] text-center">
                        <span className="block text-[9px] text-[var(--text-secondary)] uppercase font-mono tracking-widest">{t('CARB')}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{meal.nutritional_info.carbs}</span>
                      </div>
                      <div className="bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)] text-center">
                        <span className="block text-[9px] text-[var(--text-secondary)] uppercase font-mono tracking-widest">{t('FAT')}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{meal.nutritional_info.fats}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {meal.ingredients.map((ing, i) => (
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
    </motion.div>
  );
};
