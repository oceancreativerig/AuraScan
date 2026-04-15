import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface CoachCardProps {
  message: string;
}

export const CoachCard: React.FC<CoachCardProps> = ({ message }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full medical-card p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full" />
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-indigo-500">{t('Your AI Coach: Aura')}</span>
      </div>
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed italic font-light">
        "{message}"
      </p>
    </motion.div>
  );
};
