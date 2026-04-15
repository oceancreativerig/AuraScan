import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, BarChart3, Sparkles, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const { t } = useLanguage();

  const steps = [
    {
      icon: (
        <div className="flex items-center gap-2">
          <h2 className="text-4xl font-display font-bold tracking-tighter">
            <span className="text-teal-600">Aura</span>
            <span className="text-slate-900">Scan</span>
          </h2>
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
        </div>
      ),
      title: t('Welcome to AuraScan'),
      description: t('Your professional AI biometric health companion. Let\'s get you started with a quick overview of how we help you track your wellness.'),
    },
    {
      icon: <Camera className="w-12 h-12 text-teal-600" />,
      title: t('The Scanning Process'),
      description: t('Position your face in good lighting. AuraScan uses advanced computer vision to map 468+ landmarks for precise biometric analysis.'),
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-sky-600" />,
      title: t('Result Interpretation'),
      description: t('Receive instant insights on hydration, stress, and vitality markers, correlated with evidence-based wellness recommendations.'),
    },
    {
      icon: <Sparkles className="w-12 h-12 text-indigo-600" />,
      title: t('Unlock AuraScan Pro'),
      description: t('Upgrade to Pro for personalized 7-day wellness challenges, detailed historical tracking, and advanced health insights.'),
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-main)]/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
      >
        <button
          onClick={onComplete}
          className="absolute top-6 right-6 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-8 p-4 bg-[var(--bg-card-hover)] rounded-3xl border border-[var(--border-color)]">
              {steps[step].icon}
            </div>
            <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-4 tracking-tight">{steps[step].title}</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-8 font-light">{steps[step].description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-teal-600' : 'bg-[var(--border-color)]'}`}
              />
            ))}
          </div>
          
          <div className="flex gap-4">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-3 rounded-full bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-color)]"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="p-3 rounded-full bg-[var(--text-primary)] text-[var(--bg-card)] hover:opacity-90 transition-colors shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="px-8 py-3 rounded-full bg-teal-600 text-white font-bold hover:bg-teal-500 transition-colors shadow-lg"
              >
                {t('Get Started')}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
