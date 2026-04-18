import React from 'react';
import { Shield, Mail, HelpCircle, Activity, Github, Twitter, Brain, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/i18n';
import { LegalType } from './Legal';

interface FooterProps {
  onOpenLegal: (type: LegalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-20 pb-12 px-4 relative z-10 border-t border-[var(--border-color)] pt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[var(--accent-teal-soft)] rounded-xl border border-[var(--accent-teal-border)]">
                <Brain className="w-5 h-5 text-[var(--accent-teal)]" />
              </div>
              <span className="text-xl font-display font-bold text-[var(--text-primary)] tracking-tighter italic">
                AuraScan
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">
              {t('A professional AI biometric engine mapping human wellness through advanced computer vision landmarks.')}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-teal)] hover:border-[var(--accent-teal-border)] transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-teal)] hover:border-[var(--accent-teal-border)] transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-primary)] font-bold">{t('Legal Matrix')}</h4>
            <ul className="space-y-4">
              <li>
                <button onClick={() => onOpenLegal('privacy')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-all flex items-center gap-2 group">
                  <Shield className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  {t('Privacy Policy')}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('terms')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-all flex items-center gap-2 group">
                  <div className="w-4 h-4 opacity-50 flex items-center justify-center font-mono text-[8px] border border-current rounded group-hover:opacity-100">TS</div>
                  {t('Terms of Service')}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('disclaimer')} className="text-sm text-[var(--text-secondary)] hover:text-rose-500 transition-all flex items-center gap-2 group">
                  <Activity className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  {t('Medical Disclaimer')}
                </button>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-primary)] font-bold">{t('Communications')}</h4>
            <ul className="space-y-4">
              <li>
                <button onClick={() => onOpenLegal('help')} className="text-sm text-[var(--text-secondary)] hover:text-sky-500 transition-all flex items-center gap-2 group">
                  <HelpCircle className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  {t('Help Center')}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('contact')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-pink)] transition-all flex items-center gap-2 group">
                  <Mail className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  {t('Contact Us')}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('api')} className="text-sm text-[var(--text-secondary)] hover:text-purple-500 transition-all flex items-center gap-2 group">
                  <div className="w-4 h-4 opacity-50 flex items-center justify-center font-mono text-[8px] border border-current rounded group-hover:opacity-100">API</div>
                  {t('Documentation')}
                </button>
              </li>
            </ul>
          </div>

          {/* System Status */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-primary)] font-bold">{t('System Pulse')}</h4>
            <div className="p-4 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">{t('Network')}</span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest">{t('Operational')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">{t('AI Core')}</span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest">{t('Online')}</span>
              </div>
              <div className="pt-2 border-t border-[var(--border-color)]">
                <div className="h-1 w-full bg-[var(--bg-card)] rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ['100%', '98%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-[var(--border-color)]">
          <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.2em]">
            © {currentYear} AuraScan Biometric Systems. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card-hover)] border border-[var(--border-color)]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">{t('Secure Connection Established')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-[var(--text-secondary)]">{t('Engineered with')}</span>
              <Heart className="w-3 h-3 text-rose-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
