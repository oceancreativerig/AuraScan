import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, FileText, Stethoscope, HelpCircle, Mail, Book, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';
import { useLanguage } from '../lib/i18n';

export type LegalType = 'privacy' | 'terms' | 'disclaimer' | 'help' | 'contact' | 'api';

interface LegalProps {
  type: LegalType;
  isOpen: boolean;
  onClose: () => void;
}

export const Legal: React.FC<LegalProps> = ({ type, isOpen, onClose }) => {
  const { t } = useLanguage();

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return `
# Privacy Policy
*Last updated: April 2026*

At AuraScan, we prioritize your biometric privacy. This policy explains how we handle your data.

### 1. Biometric Data Processing
All face-scanning analysis is performed in real-time. We use biometric landmarks to assess wellness markers, but we do not store raw biometric templates that can be used for identification.

### 2. Data Storage
Optional health logs and scan results are stored in your private Firebase account only if you are signed in. You have full control over deleting your history at any time.

### 3. AI Processing
We utilize Google Gemini AI for health analysis. No personally identifiable information (PII) is shared with the AI models beyond the visual analysis requirements.
        `;
      case 'terms':
        return `
# Terms of Service
*Last updated: April 2026*

By using AuraScan, you agree to these professional standards.

### 1. Usage Eligibility
This application is intended for individuals aged 18 and over. 

### 2. Biometric Consent
By initiating a scan, you provide explicit consent for the application to process your facial biometric data for wellness analysis purposes.

### 3. Subscription & Pro Access
Subscription fees for AuraScan Pro are billed through the platform. Access to history and detailed coaching is restricted to registered Pro users.
        `;
      case 'disclaimer':
        return `
# Medical Disclaimer
**CRITICAL: Please Read Carefully**

### 1. Not a Medical Device
AuraScan is a wellness and informational tool. It is **NOT** a medical device, and it is NOT intended to diagnose, treat, cure, or prevent any disease or medical condition.

### 2. No Professional Advice
The analysis provided is based on AI vision markers and wellness correlations. It should never replace professional medical advice, diagnosis, or treatment.

### 3. Seek Medical Consultation
Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice.
        `;
      case 'help':
        return `
# Help Center
### How it Works
AuraScan uses advanced computer vision to map 468+ 3D landmarks on your face. It analyzes subtle markers related to:
- **Vitality**: Skin tone and texture markers.
- **Hydration**: Volume and reflectivity across the T-zone.
- **Stress**: Micro-tension in facial muscles.

### Scanning Tips
- **Lighting**: Ensure even, bright lighting (natural daylight is best).
- **Positioning**: Center your face in the oval guide.
- **Stillness**: Hold still for 3-5 seconds for the most accurate biometric decoding.
        `;
      case 'api':
        return `
# API Documentation
### Overview
AuraScan provides a biometric intelligence layer. Developers can integrate our analysis via our specialized SDK.

### Endpoint: /api/analyze
- **Method**: POST
- **Payload**: Base64 Biometric Frame
- **Returns**: Biometric Health Matrix

### Integration Requirements
All API consumers must adhere to our Biometric Privacy Standard (BPS-2026) and maintain strict end-to-end encryption for all biometric transport layers.
        `;
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-card-hover)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--accent-teal-soft)] rounded-xl border border-[var(--accent-teal-border)]">
                  {type === 'privacy' && <Shield className="w-5 h-5 text-[var(--accent-teal)]" />}
                  {type === 'terms' && <FileText className="w-5 h-5 text-[var(--accent-teal)]" />}
                  {type === 'disclaimer' && <Stethoscope className="w-5 h-5 text-rose-500" />}
                  {type === 'help' && <HelpCircle className="w-5 h-5 text-sky-500" />}
                  {type === 'api' && <Book className="w-5 h-5 text-purple-500" />}
                  {type === 'contact' && <Mail className="w-5 h-5 text-[var(--accent-pink)]" />}
                </div>
                <h2 className="text-xl font-display font-bold text-[var(--text-primary)] tracking-tight">
                  {type === 'privacy' && t('Privacy Policy')}
                  {type === 'terms' && t('Terms of Service')}
                  {type === 'disclaimer' && t('Medical Disclaimer')}
                  {type === 'help' && t('Help Center')}
                  {type === 'api' && t('API Documentation')}
                  {type === 'contact' && t('Contact Us')}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {type === 'contact' ? (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <p className="text-[var(--text-secondary)] font-light leading-relaxed">
                      {t('Have questions about AuraScan? Our technical support team is ready to assist you with biometric calibrations and account inquiries.')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a href="mailto:support@aurascan.ai" className="p-6 rounded-3xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] flex flex-col items-center gap-4 hover:border-[var(--accent-teal-border)] transition-all group">
                      <div className="p-3 bg-teal-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6 text-teal-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-secondary)] mb-1">Email Support</p>
                        <p className="text-[var(--text-primary)] font-bold">support@aurascan.ai</p>
                      </div>
                    </a>
                    
                    <div className="p-6 rounded-3xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] flex flex-col items-center gap-4">
                      <div className="p-3 bg-sky-500/10 rounded-2xl">
                        <HelpCircle className="w-6 h-6 text-sky-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-secondary)] mb-1">Response Time</p>
                        <p className="text-[var(--text-primary)] font-bold">Within 24 Hours</p>
                      </div>
                    </div>
                  </div>

                  <form className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] ml-1">{t('Your Message')}</label>
                      <textarea 
                        className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-2xl p-4 min-h-[120px] focus:outline-none focus:border-[var(--accent-teal-border)] transition-all text-sm"
                        placeholder={t('How can we help you today?')}
                      />
                    </div>
                    <button type="button" className="w-full btn-primary py-4">
                      {t('Send Transmission')}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none text-[var(--text-primary)]">
                  <div className="markdown-body">
                    <Markdown>{getContent()}</Markdown>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[var(--bg-card-hover)] border-t border-[var(--border-color)] flex justify-end px-8">
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-full border border-[var(--border-color)] text-sm font-medium hover:bg-[var(--bg-card)] transition-all text-[var(--text-primary)]"
              >
                {t('Close')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
