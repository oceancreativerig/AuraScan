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
import { HealthAnalysis } from '../services/geminiService';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

interface ResultsProps {
  analysis: HealthAnalysis;
  isPro?: boolean;
  onReset: () => void;
  onUpdateChallenge?: (dayIndex: number, completed: boolean) => void;
  onUpgrade?: () => void;
}

export const Results: React.FC<ResultsProps> = ({ analysis, isPro, onReset, onUpdateChallenge, onUpgrade }) => {
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<typeof analysis.products extends (infer T)[] ? T : never | null>(null);

  const handleExport = () => {
    if (!isPro) {
      onUpgrade?.();
      return;
    }
    window.print();
  };
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-sm';
      case 'fair': return 'text-amber-600 bg-amber-50 border-amber-100 shadow-sm';
      case 'attention_needed': return 'text-rose-600 bg-rose-50 border-rose-100 shadow-sm';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-emerald-500';
      case 'fair': return 'bg-amber-500';
      case 'attention_needed': return 'bg-rose-500';
      default: return 'bg-slate-400';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6 md:space-y-8 pb-10 md:pb-20"
    >
      {/* Header Summary */}
      <div className="medical-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center relative z-10">
          
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="currentColor" className="text-slate-200" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} className="text-slate-500" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fill="#0d9488"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Overall Score Circular Gauge */}
            <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0 flex items-center justify-center -mt-8 md:-mt-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * (analysis.overall_score || 0)) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={cn(
                    "drop-shadow-sm",
                    analysis.overall_score >= 80 ? "text-emerald-500" : analysis.overall_score >= 50 ? "text-amber-500" : "text-rose-500"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 tracking-tighter">{analysis.overall_score}</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500">{t('Score')}</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-50 rounded-xl border border-teal-100">
                <HeartPulse className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-medium text-slate-900 tracking-tight">{t('Analysis Complete')}</h2>
                <p className="text-teal-600 text-xs font-mono uppercase tracking-widest">{t('AuraScan Biometric Report')}</p>
              </div>
            </div>
            <p className="text-slate-700 text-base leading-relaxed italic font-light border-l-2 border-teal-500/30 pl-4 py-1">
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
                <span className="font-serif font-medium text-lg tracking-tight text-slate-900">{indicator.label}</span>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{t('Confidence')}</span>
                    <span className="text-xs font-mono text-teal-600">{Math.round(indicator.confidence * 100)}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/50 border border-white/20">
                    {getIndicatorIcon(indicator.label, indicator.status)}
                  </div>
                </div>
              </div>
              
              {/* Facial Signs Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {indicator.facial_signs?.map((sign, i) => (
                  <span key={i} className="px-2 py-1 text-[10px] uppercase tracking-wider font-mono bg-white/50 text-slate-500 rounded-md border border-slate-200/50">
                    {sign}
                  </span>
                ))}
              </div>

              <p className="text-sm text-slate-700 leading-relaxed mb-6 font-light">
                {indicator.systemic_implication}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-auto pt-4 border-t border-slate-900/5">
              <div className="flex justify-between text-xs font-mono uppercase tracking-wider mb-2 opacity-70">
                <span>{t(indicator.status.replace('_', ' '))}</span>
                <span>{indicator.score}/100</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900/5 rounded-full overflow-hidden">
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-serif font-medium text-slate-900 flex items-center gap-3 tracking-tight">
                <div className="p-2 bg-teal-50 rounded-xl border border-teal-100">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-teal-600" />
                </div>
                {analysis.challenge.title}
              </h3>
              <p className="text-slate-600 text-sm mt-2 max-w-xl font-light">{analysis.challenge.description}</p>
            </div>
            
            {/* Progress Tracker */}
            <div className="flex flex-col items-end gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 w-full md:w-auto">
              <div className="flex justify-between w-full items-center gap-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">{t('Progress')}</span>
                <span className="text-sm font-bold text-teal-600">
                  {analysis.challenge?.days?.filter(d => d.completed).length || 0} / 7
                </span>
              </div>
              <div className="flex gap-1">
                {analysis.challenge?.days?.map((day, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "h-1.5 w-4 rounded-full transition-colors",
                      day.completed ? "bg-teal-500" : "bg-slate-200"
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
                  "p-4 rounded-2xl border transition-all group cursor-pointer relative overflow-hidden",
                  day.completed 
                    ? "bg-teal-50 border-teal-200 shadow-sm" 
                    : "bg-slate-50 border-slate-100 hover:border-teal-200"
                )}
              >
                {day.completed && (
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
                )}
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className={cn(
                    "text-xs font-mono transition-colors",
                    day.completed ? "text-teal-700 font-bold" : "text-teal-600/60 group-hover:text-teal-600"
                  )}>
                    {t('DAY')} {day.day}
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                    day.completed 
                      ? "bg-teal-500 border-teal-500 text-white" 
                      : "border-slate-300 group-hover:border-teal-400 bg-white"
                  )}>
                    {day.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-teal-400 transition-colors" />
                    )}
                  </div>
                </div>
                <p className={cn(
                  "text-sm leading-relaxed transition-colors relative z-10",
                  day.completed ? "text-teal-900 font-medium" : "text-slate-600 font-light group-hover:text-slate-900"
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
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/5 blur-[80px] rounded-full pointer-events-none" />
        <h3 className="text-xl md:text-2xl font-serif font-medium text-slate-900 mb-6 md:mb-8 flex items-center gap-3 relative z-10 tracking-tight">
          <div className="p-2 bg-teal-50 rounded-lg border border-teal-100">
            <ArrowRight className="w-5 h-5 text-teal-600" />
          </div>
          {t('Personalized Recommendations')}
        </h3>
        <div className="space-y-3 md:space-y-4 relative z-10">
          {analysis.recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
              className="flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                {getRecommendationIcon(rec.category)}
              </div>
              <div className="flex flex-col">
                <span className="text-teal-600 text-xs font-mono uppercase tracking-wider mb-1">{rec.category}</span>
                <p className="text-slate-700 leading-relaxed font-light">{rec.tip}</p>
              </div>
            </motion.div>
          ))}
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
            <h3 className="text-xl font-serif font-medium text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-teal-600" />
              {t('Recommended for You')}
            </h3>
            {!isPro && (
              <span className="text-[10px] font-mono bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {t('Pro Feature')}
              </span>
            )}
          </div>

          <div className={`space-y-4 ${!isPro ? 'blur-sm pointer-events-none select-none' : ''}`}>
            {analysis.products?.map((product, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-teal-500/30 transition-all hover:shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-teal-600 uppercase tracking-widest mb-1 block">{product.brand || t('Premium Choice')}</span>
                    <h4 className="font-bold text-slate-900 text-lg">{product.name}</h4>
                  </div>
                  <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">{product.price || '$--.--'}</span>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{product.reason}</p>
                <div className="flex gap-2">
                  <a 
                    href={product.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {t('Add to Cart')}
                  </a>
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                  >
                    {t('Details')}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[2px] z-10">
              <button
                onClick={onUpgrade}
                className="px-6 py-2 bg-amber-500 text-white font-bold rounded-full shadow-lg hover:bg-amber-600 transition-colors text-sm"
              >
                {t('Unlock Recommendations')}
              </button>
            </div>
          )}
        </motion.div>

        {/* Personalized Nutrition */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="medical-card p-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif font-medium text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-sky-600" />
              {t('Personalized Nutrition')}
            </h3>
            {!isPro && (
              <span className="text-[10px] font-mono bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {t('Pro Feature')}
              </span>
            )}
          </div>

          <div className={`space-y-6 ${!isPro ? 'blur-sm pointer-events-none select-none' : ''}`}>
            {analysis.meals?.map((meal, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
                <div className="h-40 w-full relative overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${meal.image_keyword || 'healthy-food'}/600/400`} 
                    alt={meal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-white font-bold text-lg leading-tight">{meal.title}</h4>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">{meal.description}</p>
                  
                  {/* Nutritional Info */}
                  {meal.nutritional_info && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                        <span className="block text-[10px] text-slate-500 uppercase font-mono">{t('CAL')}</span>
                        <span className="text-xs font-bold text-slate-900">{meal.nutritional_info.calories}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                        <span className="block text-[10px] text-slate-500 uppercase font-mono">{t('PRO')}</span>
                        <span className="text-xs font-bold text-slate-900">{meal.nutritional_info.protein}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                        <span className="block text-[10px] text-slate-500 uppercase font-mono">{t('CARB')}</span>
                        <span className="text-xs font-bold text-slate-900">{meal.nutritional_info.carbs}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                        <span className="block text-[10px] text-slate-500 uppercase font-mono">{t('FAT')}</span>
                        <span className="text-xs font-bold text-slate-900">{meal.nutritional_info.fats}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {meal.ingredients.map((ing, i) => (
                      <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600 font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[2px] z-10">
              <button
                onClick={onUpgrade}
                className="px-6 py-2 bg-amber-500 text-white font-bold rounded-full shadow-lg hover:bg-amber-600 transition-colors text-sm"
              >
                {t('Unlock Meal Plans')}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Disclaimer */}
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl">
        <div className="flex items-center gap-3 mb-2 text-rose-600">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wider">{t('Medical Disclaimer')}</span>
        </div>
        <p className="text-rose-600/90 text-xs leading-relaxed font-light">
          {analysis.disclaimer} {t('AuraScan is an AI-powered wellness tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.')}
        </p>
      </div>

      {/* Action */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 md:pt-8 pb-8 md:pb-12">
        <button
          onClick={handleExport}
          className="group relative px-8 md:px-10 py-3 md:py-4 bg-white border-2 border-slate-200 text-slate-900 font-bold rounded-full overflow-hidden transition-all hover:border-teal-500 active:scale-95 shadow-lg shadow-slate-200/20 w-full sm:w-auto"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <Download className="w-5 h-5" />
            {t('Export Report')}
            {!isPro && <Lock className="w-3 h-3 text-amber-500" />}
          </span>
        </button>
        <button
          onClick={onReset}
          className="group relative px-8 md:px-10 py-3 md:py-4 bg-slate-900 text-white font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20 w-full sm:w-auto"
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
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100">
                    <ShoppingBag className="w-8 h-8 text-teal-600" />
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono text-teal-600 uppercase tracking-[0.2em] mb-2 block">
                      {selectedProduct.brand || t('Premium Recommendation')}
                    </span>
                    <h3 className="text-3xl font-serif font-medium text-slate-900 leading-tight">
                      {selectedProduct.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xl shadow-lg">
                      {selectedProduct.price || '$--.--'}
                    </div>
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                      {selectedProduct.type === 'SKINCARE' ? t('Skincare Solution') : t('Wellness Supplement')}
                    </span>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
                      {t('Why it was selected')}
                    </h4>
                    <p className="text-slate-700 leading-relaxed font-light">
                      {selectedProduct.reason}
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <a
                      href={selectedProduct.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-8 py-4 bg-slate-900 text-white font-bold rounded-full flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {t('Buy Now')}
                    </a>
                    <a
                      href={selectedProduct.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-full flex items-center justify-center hover:bg-slate-50 transition-all"
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
