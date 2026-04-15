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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
      >
        <button
          onClick={onComplete}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
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
            <div className="mb-8 p-4 bg-slate-50 rounded-3xl">
              {steps[step].icon}
            </div>
            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-4">{steps[step].title}</h2>
            <p className="text-slate-600 leading-relaxed mb-8">{steps[step].description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-teal-600' : 'bg-slate-200'}`}
              />
            ))}
          </div>
          
          <div className="flex gap-4">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-3 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="p-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="px-8 py-3 rounded-full bg-teal-600 text-white font-bold hover:bg-teal-500 transition-colors"
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
