import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { db, auth } from '../lib/firebase';
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
    try {
      await addDoc(collection(db, 'feedback'), {
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
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-slate-900 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all group"
        title={t('Feedback')}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 px-3 py-1 bg-white text-slate-900 text-xs font-mono uppercase tracking-widest rounded-lg border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-xl border border-teal-100">
                      <MessageSquare className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-serif font-medium text-slate-900 tracking-tight">{t('Help us improve AuraScan')}</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
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
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-slate-900 font-medium">{t('Thank you for your feedback!')}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-2 ml-1">
                        {t('Your feedback')}
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder={t('Tell us what you think or report an issue...')}
                        className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all resize-none"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 px-6 py-3 rounded-full border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                      >
                        {t('Cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !feedback.trim()}
                        className={cn(
                          "flex-[2] px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                          isSubmitting || !feedback.trim()
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                            : "bg-slate-900 text-white hover:bg-slate-800 active:scale-95"
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
