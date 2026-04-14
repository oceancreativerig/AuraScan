import React, { useState, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { Results } from './components/Results';
import { History } from './components/History';
import { FeedbackModal } from './components/FeedbackModal';
import { analyzeFaceHealth, translateAnalysis, HealthAnalysis } from './services/geminiService';
import { Shield, Sparkles, Activity, LogIn, LogOut, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, loginWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, getDoc } from 'firebase/firestore';
import { useLanguage, languages } from './lib/i18n';

type AppState = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'RESULTS' | 'ERROR' | 'HISTORY';

export default function App() {
  const [state, setState] = useState<AppState>('IDLE');
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [latestScan, setLatestScan] = useState<(HealthAnalysis & { id: string }) | null>(null);
  const [focusArea, setFocusArea] = useState<string>('General Wellness');

  const focusAreas = [
    'General Wellness',
    'Skin & Aging',
    'Cardiovascular Health',
    'Stress & Fatigue',
    'Digestive Health',
    'Immune System'
  ];

  useEffect(() => {
    // Handle potential errors from mobile redirect login
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect login error:", err);
      const domain = window.location.hostname;
      setError(`${t("Login failed.")} ${t("Please ensure this domain is added to Firebase Authorized Domains:")} ${domain}`);
      setState('ERROR');
    });

    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (currentUser) {
        // Ensure user profile exists in Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            const userData: any = {
              uid: currentUser.uid,
              createdAt: serverTimestamp()
            };
            if (currentUser.email) userData.email = currentUser.email;
            if (currentUser.displayName) userData.displayName = currentUser.displayName;
            if (currentUser.photoURL) userData.photoURL = currentUser.photoURL;
            
            await setDoc(userRef, userData);
          }

          // Fetch latest scan for the daily insight
          const q = query(
            collection(db, 'users', currentUser.uid, 'scans'),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
              const doc = snapshot.docs[0];
              setLatestScan({ ...doc.data(), id: doc.id } as HealthAnalysis & { id: string });
            }
          }, (error) => {
            console.error("Snapshot error:", error);
          });
        } catch (err) {
          console.error("Error creating user profile:", err);
        }
      } else {
        setLatestScan(null);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // Translate analysis when language changes or when viewing a past scan
  useEffect(() => {
    const updateTranslations = async () => {
      if (analysis && state === 'RESULTS' && analysis.language !== language) {
        try {
          const translated = await translateAnalysis(analysis, language);
          setAnalysis({ ...translated, language });
        } catch (err) {
          console.error("Failed to translate analysis:", err);
        }
      }
      if (latestScan && state === 'IDLE' && latestScan.language !== language) {
        try {
          const translated = await translateAnalysis(latestScan, language);
          setLatestScan({ ...translated, language, id: latestScan.id });
        } catch (err) {
          console.error("Failed to translate latest scan:", err);
        }
      }
    };
    updateTranslations();
  }, [language, analysis, latestScan, state]);

  const handleCapture = async (base64Image: string) => {
    setState('ANALYZING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const result = await analyzeFaceHealth(base64Image, language, focusArea);
      setAnalysis(result);
      setState('RESULTS');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Save to Firebase if logged in
      if (user) {
        try {
          const docRef = await addDoc(collection(db, 'users', user.uid, 'scans'), {
            ...result,
            language,
            focusArea,
            createdAt: serverTimestamp()
          });
          setCurrentScanId(docRef.id);
        } catch (err) {
          console.error("Error saving scan to history:", err);
        }
      } else {
        setCurrentScanId(null);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t("Analysis failed. Please try again."));
      setState('ERROR');
    }
  };

  const handleUpdateChallenge = async (dayIndex: number, completed: boolean) => {
    if (!analysis) return;
    
    const updatedAnalysis = { ...analysis };
    updatedAnalysis.challenge.days[dayIndex].completed = completed;
    setAnalysis(updatedAnalysis);

    if (user && currentScanId) {
      try {
        const scanRef = doc(db, 'users', user.uid, 'scans', currentScanId);
        await setDoc(scanRef, { challenge: updatedAnalysis.challenge }, { merge: true });
      } catch (err) {
        console.error("Error updating challenge progress:", err);
      }
    }
  };

  const reset = () => {
    setAnalysis(null);
    setCurrentScanId(null);
    setError(null);
    setState('SCANNING');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute w-[800px] h-[800px] bg-teal-500/5 blur-[120px] rounded-full animate-blob opacity-50" />
        <div className="absolute w-[600px] h-[600px] bg-sky-500/5 blur-[120px] rounded-full animate-blob animation-delay-2000 opacity-50" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-6 md:py-12 flex flex-col items-center min-h-screen">
        {/* Top Navigation */}
        <nav className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 md:mb-12">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 ml-1">{t('Language')}</span>
              <div className="relative group">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-full px-4 py-2 pr-8 text-sm font-medium hover:border-slate-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang} className="bg-white text-slate-900">{lang}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          {authReady && (
            user ? (
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() => setState('HISTORY')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
                >
                  <Clock className="w-4 h-4" />
                  {t('History')}
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" referrerPolicy="no-referrer" />
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('Logout')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all text-sm font-bold shadow-lg shadow-slate-900/10 w-full sm:w-auto justify-center"
              >
                <LogIn className="w-4 h-4" />
                {t('Sign in to Save Scans')}
              </button>
            )
          )}
        </nav>

        {/* Header */}
        {state !== 'HISTORY' && (
          <header className="text-center mb-10 md:mb-16 mt-2 md:mt-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 text-xs font-mono tracking-widest uppercase mb-6"
          >
            <Sparkles className="w-4 h-4" />
            {t('AI-Powered Biometrics')}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            className="text-5xl md:text-8xl font-serif font-medium tracking-tight mb-4 md:mb-6 text-slate-900"
          >
            AuraScan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 max-w-xl mx-auto text-base md:text-xl font-light leading-relaxed px-4"
          >
            {t('Advanced facial analysis for full-body wellness insights and personalized health recommendations.')}
          </motion.p>
        </header>
        )}

        <AnimatePresence mode="wait">
          {state === 'IDLE' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center gap-8 py-12"
            >
              {/* Daily Insight Card */}
              {latestScan && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md w-full medical-card p-6 relative overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setAnalysis(latestScan);
                    setState('RESULTS');
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-[40px] rounded-full" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-teal-500/10 rounded-lg">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-teal-600">{t('Daily Wellness Insight')}</span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">
                    {t('Based on your last scan, focus on')} <span className="text-teal-600 font-bold">{latestScan.indicators.sort((a, b) => a.score - b.score)[0].label}</span> {t('today.')}
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs italic">"{latestScan.recommendations[0].tip}"</p>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-4 w-full max-w-md"
              >
                <div className="w-full flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700 ml-1">{t('Select Focus Area')}</label>
                  <div className="relative group">
                    <select
                      value={focusArea}
                      onChange={(e) => setFocusArea(e.target.value)}
                      className="w-full appearance-none bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 pr-12 text-base font-medium text-slate-900 hover:border-teal-500/50 transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 shadow-sm"
                    >
                      {focusAreas.map(area => (
                        <option key={area} value={area} className="bg-white text-slate-900">{t(area)}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-teal-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setState('SCANNING')}
                  className="group relative w-full px-12 py-5 bg-slate-900 text-white font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-slate-900/20"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {t('Start Health Scan')}
                    <Activity className="w-6 h-6 group-hover:animate-pulse" />
                  </span>
                </button>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 text-sm flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                {t('Requires camera access for facial analysis')}
              </motion.p>

              {/* Accuracy Guide */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="max-w-md w-full p-6 medical-card mt-4"
              >
                <h4 className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-4 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  {t('Accuracy Tip: Perfect Lighting')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-900 text-sm font-medium">{t('Face the Light')}</span>
                    <span className="text-slate-500 text-xs">{t('Position yourself towards a window or lamp.')}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-900 text-sm font-medium">{t('No Shadows')}</span>
                    <span className="text-slate-500 text-xs">{t('Ensure even lighting across your entire face.')}</span>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-12">
                <FeatureCard
                  icon={<Shield className="w-8 h-8 text-teal-600" />}
                  title={t('Secure Analysis')}
                  description={t('Your biometric data is processed securely and never stored on our servers.')}
                  delay={0.5}
                />
                <FeatureCard
                  icon={<Activity className="w-8 h-8 text-sky-600" />}
                  title={t('Real-time Insights')}
                  description={t('Get instant feedback on hydration, stress, and vitality markers.')}
                  delay={0.6}
                />
                <FeatureCard
                  icon={<Sparkles className="w-8 h-8 text-indigo-600" />}
                  title={t('AI Wellness')}
                  description={t('Personalized recommendations powered by advanced machine learning.')}
                  delay={0.7}
                />
              </div>
            </motion.div>
          )}

          {(state === 'SCANNING' || state === 'ANALYZING') && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <Scanner onCapture={handleCapture} isAnalyzing={state === 'ANALYZING'} />
              <div className="mt-8 text-center">
                <button
                  onClick={() => setState('IDLE')}
                  className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
                >
                  {t('Cancel Scan')}
                </button>
              </div>
            </motion.div>
          )}

          {state === 'HISTORY' && user && (
            <History 
              onBack={() => setState('IDLE')} 
              onViewScan={(scan) => {
                setAnalysis(scan);
                setCurrentScanId(scan.id || null);
                setState('RESULTS');
              }} 
            />
          )}

          {state === 'RESULTS' && analysis && (
            <Results 
              key="results" 
              analysis={analysis} 
              onReset={reset} 
              onUpdateChallenge={handleUpdateChallenge}
            />
          )}

          {state === 'ERROR' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-rose-600" />
              </div>
              <h2 className="text-2xl font-serif font-medium mb-2">{t('Analysis Failed')}</h2>
              <p className="text-slate-500 mb-8">{error}</p>
              <button
                onClick={reset}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
              >
                {t('Try Again')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-auto pt-10 md:pt-20 pb-8 text-center text-slate-400 text-xs uppercase tracking-[0.2em] px-4 font-mono">
          {t('© 2026 AuraScan Biometrics • For Informational Purposes Only')}
        </footer>
      </main>

      <FeedbackModal />
    </div>
  );
}

function FeatureCard({ icon, title, description, delay = 0 }: { icon: React.ReactNode; title: string; description: string; delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="p-8 medical-card group cursor-pointer"
    >
      <div className="mb-6 p-4 bg-slate-50 rounded-2xl inline-block group-hover:bg-white transition-colors border border-slate-100">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-medium text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-light">{description}</p>
    </motion.div>
  );
}
