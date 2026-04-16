import React, { useState, useEffect, useRef } from 'react';
import { Scanner } from './components/Scanner';
import { Results } from './components/Results';
import { History } from './components/History';
import { FeedbackModal } from './components/FeedbackModal';
import { Onboarding } from './components/Onboarding';
import { CoachCard } from './components/CoachCard';
import { analyzeFaceHealth, translateAnalysis, generateCoachingMessage } from './services/auraService';
import { HealthAnalysis } from './types';
import { Shield, Sparkles, Activity, LogIn, LogOut, Clock, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, getDoc, getDocFromServer, updateDoc, increment } from 'firebase/firestore';
import { useLanguage, languages } from './lib/i18n';

import { AdminPanel } from './components/AdminPanel';
import { ThemeProvider, useTheme } from './lib/ThemeContext';

type AppState = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'RESULTS' | 'HISTORY' | 'ADMIN' | 'ERROR';

function AppContent() {
  const [state, setState] = useState<AppState>('IDLE');
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
          setError(t("Firebase configuration error. Please check your settings."));
          setState('ERROR');
        }
        // Skip logging for other errors, as this is simply a connection test.
      }
    }
    testConnection();
  }, [t]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Login error:", err);
      let message = t("Login failed. Please try again.");
      if (err.code === 'auth/popup-blocked') {
        message = t("Popup blocked. Please allow popups for this site.");
      } else if (err.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        message = `${t("Login failed.")} ${t("Please ensure this domain is added to Firebase Authorized Domains:")} ${domain}`;
      } else if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, do nothing
        console.log("User closed the login popup.");
        return;
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      setState('ERROR');
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      handleLogin();
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { isPro: true }, { merge: true });
      setIsPro(true);
      alert(t("Welcome to AuraScan Pro!"));
    } catch (err) {
      console.error("Upgrade error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setState('IDLE');
      setAnalysis(null);
      setCurrentScanId(null);
      setError(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const [latestScan, setLatestScan] = useState<(HealthAnalysis & { id: string }) | null>(null);
  const [scanHistory, setScanHistory] = useState<(HealthAnalysis & { id: string })[]>([]);
  const [coachingMessage, setCoachingMessage] = useState<string | null>(null);
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
        const userPath = `users/${currentUser.uid}`;
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          let userSnap;
          try {
            userSnap = await getDoc(userRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, userPath);
          }
          
          if (!userSnap || !userSnap.exists()) {
            const userData: any = {
              uid: currentUser.uid,
              createdAt: serverTimestamp()
            };
            if (currentUser.email) userData.email = currentUser.email;
            if (currentUser.displayName) userData.displayName = currentUser.displayName;
            if (currentUser.photoURL) userData.photoURL = currentUser.photoURL;
            
            try {
              await setDoc(userRef, userData);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, userPath);
            }
            setIsAdmin(currentUser.email === 'oceancreativerig@gmail.com');
            setIsPro(false);
          } else {
            const userData = userSnap.data();
            setIsAdmin(userData.role === 'admin' || currentUser.email === 'oceancreativerig@gmail.com');
            setIsPro(userData.isPro || false);
          }

          // Fetch latest scan for the daily insight
          const scansPath = `users/${currentUser.uid}/scans`;
          const q = query(
            collection(db, 'users', currentUser.uid, 'scans'),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
              const scans = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HealthAnalysis & { id: string }));
              setLatestScan(scans[0]);
              setScanHistory(scans);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.LIST, scansPath);
          });
        } catch (err) {
          console.error("Error in auth state change:", err);
        }
      } else {
        setLatestScan(null);
        setScanHistory([]);
        setCoachingMessage(null);
        setIsAdmin(false);
        setIsPro(false);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // Generate coaching message when latest scan changes
  const lastCoachedScanId = useRef<string | null>(null);
  useEffect(() => {
    if (latestScan && scanHistory.length > 0 && latestScan.id !== lastCoachedScanId.current) {
      lastCoachedScanId.current = latestScan.id;
      generateCoachingMessage(scanHistory, latestScan, language).then(setCoachingMessage);
    }
  }, [latestScan, scanHistory, language]);

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
        const scansPath = `users/${user.uid}/scans`;
        try {
          const docRef = await addDoc(collection(db, scansPath), {
            ...result,
            language,
            focusArea,
            createdAt: serverTimestamp()
          });
          setCurrentScanId(docRef.id);

          // Increment global counter for admin panel
          const statsRef = doc(db, 'stats', 'global');
          try {
            await updateDoc(statsRef, {
              totalScans: increment(1)
            });
          } catch (e) {
            // If doc doesn't exist, create it
            await setDoc(statsRef, { totalScans: 1 }, { merge: true });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, scansPath);
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
      const scanPath = `users/${user.uid}/scans/${currentScanId}`;
      try {
        const scanRef = doc(db, 'users', user.uid, 'scans', currentScanId);
        await setDoc(scanRef, { challenge: updatedAnalysis.challenge }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, scanPath);
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-teal-500/30 transition-colors duration-300 overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full animate-blob opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full animate-blob animation-delay-2000 opacity-40" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full animate-blob animation-delay-4000 opacity-30" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-6 md:py-12 flex flex-col items-center min-h-screen">
        {/* Top Navigation */}
        <nav className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 md:mb-12">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setState('IDLE')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all text-sm font-medium shadow-xl text-[var(--text-primary)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              {t('Home')}
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-lg"
              title={theme === 'light' ? t('Switch to Dark Mode') : t('Switch to Light Mode')}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-1">{t('Language')}</span>
              <div className="relative group">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border-color)] rounded-full px-4 py-2 pr-8 text-sm font-medium hover:border-[var(--accent-teal)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-[var(--text-primary)]"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{lang}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          {authReady && (
            user ? (
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                {!isPro && (
                  <button
                    onClick={handleUpgrade}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all text-sm font-bold shadow-xl"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t('Upgrade to Pro')}
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setState('ADMIN')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--accent-teal-border)] text-[var(--accent-teal)] hover:bg-[var(--accent-teal-soft)] transition-all text-sm font-medium shadow-xl"
                  >
                    <Shield className="w-4 h-4" />
                    {t('Admin')}
                  </button>
                )}
                <button
                  onClick={() => setState('HISTORY')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all text-sm font-medium shadow-xl text-[var(--text-primary)]"
                >
                  <Clock className="w-4 h-4" />
                  {t('History')}
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-color)]">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-[var(--border-color)] shadow-xl" referrerPolicy="no-referrer" />
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('Logout')}
                  </button>
                </div>
              </div>
            ) : (
              <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-[var(--text-primary)] text-[var(--bg-card)] hover:opacity-90 transition-all text-sm font-bold shadow-xl w-full sm:w-auto justify-center"
            >
              <LogIn className="w-4 h-4" />
              {t('Sign in to Save Scans')}
            </button>
            )
          )}
        </nav>

        {/* Header */}
        {state !== 'HISTORY' && state !== 'ADMIN' && (
          <header className="text-center mb-10 md:mb-16 mt-2 md:mt-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-mono tracking-[0.3em] uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              {t('AI-Powered Biometrics')}
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            className="text-7xl md:text-9xl font-display font-bold tracking-tighter mb-4 md:mb-6 flex items-center justify-center gap-2"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--accent-teal)] via-[var(--text-primary)] to-[var(--text-secondary)]">
              Aura
            </span>
            <span className="relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-tr from-[var(--text-primary)] to-[var(--accent-teal)]">
                Scan
              </span>
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-4 w-2 h-2 bg-[var(--accent-teal)] rounded-full blur-[2px]" 
              />
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-secondary)] max-w-xl mx-auto text-base md:text-xl font-light leading-relaxed px-4"
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
                <div className="flex flex-col gap-4 w-full max-w-md">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="medical-card p-6 relative overflow-hidden cursor-pointer group border-teal-500/20"
                    onClick={() => {
                      setAnalysis(latestScan);
                      setState('RESULTS');
                    }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[40px] rounded-full group-hover:bg-teal-500/20 transition-all" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[var(--accent-teal-soft)] rounded-lg">
                        <Sparkles className="w-4 h-4 text-[var(--accent-teal)]" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent-teal)]">{t('Daily Wellness Insight')}</span>
                    </div>
                    <p className="text-[var(--text-primary)] text-sm leading-relaxed mb-4">
                      {t('Based on your last scan, focus on')} <span className="text-[var(--accent-teal)] font-bold">{latestScan.indicators?.sort((a, b) => a.score - b.score)[0]?.label || t('wellness')}</span> {t('today.')}
                    </p>
                    <div className="p-3 bg-[var(--bg-card-hover)] rounded-xl border border-[var(--border-color)]">
                      <p className="text-[var(--text-secondary)] text-xs italic">"{latestScan.recommendations[0].tip}"</p>
                    </div>
                  </motion.div>
                  {coachingMessage && <CoachCard message={coachingMessage} />}
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-4 w-full max-w-md"
              >
                <div className="w-full flex flex-col gap-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] ml-1">{t('Select Focus Area')}</label>
                  <div className="relative group">
                    <select
                      value={focusArea}
                      onChange={(e) => setFocusArea(e.target.value)}
                      className="w-full appearance-none bg-[var(--bg-card)] backdrop-blur-md border-2 border-[var(--border-color)] rounded-2xl px-6 py-4 pr-12 text-base font-medium text-[var(--text-primary)] hover:border-[var(--accent-teal)] transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[var(--accent-teal)] shadow-2xl"
                    >
                      {focusAreas.map(area => (
                        <option key={area} value={area} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t(area)}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)] group-hover:text-[var(--accent-teal)] transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setState('SCANNING')}
                  className="group relative w-full px-12 py-5 bg-[var(--text-primary)] text-[var(--bg-card)] font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
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
                className="text-[var(--text-secondary)] text-sm flex items-center gap-2"
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
                <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--accent-teal)] mb-4 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  {t('Accuracy Tip: Perfect Lighting')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[var(--text-primary)] text-sm font-medium">{t('Face the Light')}</span>
                    <span className="text-[var(--text-secondary)] text-xs">{t('Position yourself towards a window or lamp.')}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[var(--text-primary)] text-sm font-medium">{t('No Shadows')}</span>
                    <span className="text-[var(--text-secondary)] text-xs">{t('Ensure even lighting across your entire face.')}</span>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-12">
                <FeatureCard
                  icon={<Shield className="w-8 h-8 text-[var(--accent-teal)]" />}
                  title={t('Secure Analysis')}
                  description={t('Your biometric data is processed securely and never stored on our servers.')}
                  delay={0.5}
                />
                <FeatureCard
                  icon={<Activity className="w-8 h-8 text-sky-400" />}
                  title={t('Real-time Insights')}
                  description={t('Get instant feedback on hydration, stress, and vitality markers.')}
                  delay={0.6}
                />
                <FeatureCard
                  icon={<Sparkles className="w-8 h-8 text-purple-400" />}
                  title={t('AI Wellness')}
                  description={t('Personalized recommendations powered by advanced machine learning.')}
                  delay={0.7}
                />
              </div>

              {/* How it Works */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="max-w-4xl w-full mt-20 text-center"
              >
                <h3 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-12 tracking-tight">{t('How AuraScan Works')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--accent-teal-soft)] flex items-center justify-center text-[var(--accent-teal)] font-mono text-xl border border-[var(--accent-teal-border)] shadow-xl">01</div>
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">{t('Facial Mapping')}</h4>
                    <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">{t('Our AI identifies 468+ biometric landmarks to assess micro-expressions and skin markers.')}</p>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 font-mono text-xl border border-sky-500/20 shadow-xl">02</div>
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">{t('Systemic Analysis')}</h4>
                    <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">{t('Markers are correlated with systemic health indicators like hydration, stress, and metabolism.')}</p>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-mono text-xl border border-purple-500/20 shadow-xl">03</div>
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">{t('Wellness Plan')}</h4>
                    <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">{t('Receive a personalized 7-day challenge and evidence-based lifestyle recommendations.')}</p>
                  </div>
                </div>
              </motion.div>
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

          {state === 'ADMIN' && isAdmin && (
            <AdminPanel onBack={() => setState('IDLE')} />
          )}

          {state === 'RESULTS' && analysis && (
            <Results 
              key="results" 
              analysis={analysis} 
              isPro={isPro}
              onReset={reset} 
              onUpdateChallenge={handleUpdateChallenge}
              onUpgrade={handleUpgrade}
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
              <h2 className="text-2xl font-display font-bold mb-2 text-[var(--text-primary)]">{t('Analysis Failed')}</h2>
              <p className="text-[var(--text-secondary)] mb-8">{error}</p>
              <button
                onClick={reset}
                className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-card)] font-bold rounded-full hover:opacity-90 transition-colors shadow-lg"
              >
                {t('Try Again')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-auto pt-20 pb-12 w-full max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-t border-[var(--border-color)] pt-12">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-display font-bold tracking-tight">
                  <span className="text-[var(--accent-teal)]">Aura</span>
                  <span className="text-[var(--text-primary)]">Scan</span>
                </h3>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] animate-pulse" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">
                {t('Professional-grade biometric analysis for the modern wellness journey. Empowering individuals with data-driven health insights.')}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-secondary)]">{t('Legal')}</h4>
              <nav className="flex flex-col gap-2">
                <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-all text-left">{t('Privacy Policy')}</button>
                <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-all text-left">{t('Terms of Service')}</button>
                <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-all text-left">{t('Medical Disclaimer')}</button>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-secondary)]">{t('Support')}</h4>
              <nav className="flex flex-col gap-2">
                <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-all text-left">{t('Help Center')}</button>
                <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-all text-left">{t('Contact Us')}</button>
                <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-all text-left">{t('API Documentation')}</button>
              </nav>
            </div>
          </div>
          <div className="text-center text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.4em] font-mono opacity-50">
            {t('© 2026 AuraScan Biometrics • For Informational Purposes Only')}
          </div>
        </footer>
      </main>

      <FeedbackModal />
      {showOnboarding && <Onboarding onComplete={handleCompleteOnboarding} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
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
      <div className="mb-6 p-4 bg-[var(--bg-card-hover)] rounded-2xl inline-block group-hover:bg-[var(--bg-card)] transition-all border border-[var(--border-color)]">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-3 tracking-tight">{title}</h3>
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-light">{description}</p>
    </motion.div>
  );
}
