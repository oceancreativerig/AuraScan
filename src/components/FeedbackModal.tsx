import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

export const FeedbackModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    const feedbackPath = 'feedback';
    try {
      await addDoc(collection(db, feedbackPath), {
        text: feedback,
        userId: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || 'anonymous',
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        platform: navigator.platform
      });
      setIsSuccess(true);
      setFeedback('');
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, feedbackPath);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-[var(--text-primary)] text-[var(--bg-card)] rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group"
        title={t('Feedback')}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 px-3 py-1 bg-[var(--bg-card)] text-[var(--text-primary)] text-[10px] font-mono uppercase tracking-[0.2em] rounded-lg border border-[var(--border-color)] shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {t('Feedback')}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[var(--bg-main)]/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--accent-teal-soft)] rounded-xl border border-[var(--accent-teal-border)]">
                      <MessageSquare className="w-5 h-5 text-[var(--accent-teal)]" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-[var(--text-primary)] tracking-tight">{t('Help us improve AuraScan')}</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-[var(--bg-card-hover)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-[var(--text-primary)] font-medium">{t('Thank you for your feedback!')}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2 ml-1">
                        {t('Your feedback')}
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder={t('Tell us what you think or report an issue...')}
                        className="w-full h-32 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-2xl p-4 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)]/20 focus:border-[var(--accent-teal)] transition-all resize-none font-light"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 px-6 py-3 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-card-hover)] transition-colors text-sm"
                      >
                        {t('Cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !feedback.trim()}
                        className={cn(
                          "flex-[2] px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-xl text-sm",
                          isSubmitting || !feedback.trim()
                            ? "bg-[var(--bg-card-hover)] text-[var(--text-secondary)] cursor-not-allowed shadow-none"
                            : "bg-[var(--text-primary)] text-[var(--bg-card)] hover:opacity-90 active:scale-95"
                        )}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('Sending...')}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            {t('Submit Feedback')}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
