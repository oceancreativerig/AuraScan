import React, { useState, useEffect, useRef } from 'react';
import { Scanner } from './components/Scanner';
import { Results } from './components/Results';
import { History } from './components/History';
import { FeedbackModal } from './components/FeedbackModal';
import { Onboarding } from './components/Onboarding';
import { CoachCard } from './components/CoachCard';
import { analyzeFaceHealth, translateAnalysis, generateCoachingMessage } from './services/auraService';
import { HealthAnalysis } from './types';
import { Shield, Sparkles, Activity, LogIn, LogOut, Clock, Sun, Moon, ChevronRight, Zap, Brain } from 'lucide-react';
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
  const [authReady, setAuthReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const { language, setLanguage, t } = useLanguage();

  const XP_PER_LEVEL = 100;
  const XP_PER_SCAN = 25;

  useEffect(() => {
    if (totalScans > 0) {
      const totalXP = totalScans * XP_PER_SCAN;
      const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
      const xp = totalXP % XP_PER_LEVEL;
      setUserLevel(level);
      setUserXP(xp);
    }
  }, [totalScans]);
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
              createdAt: serverTimestamp(),
              totalScans: 0
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
            setTotalScans(0);
          } else {
            const userData = userSnap.data();
            setIsAdmin(userData.role === 'admin' || currentUser.email === 'oceancreativerig@gmail.com');
            setTotalScans(userData.totalScans || 0);
          }

          // Fetch latest scan for the daily insight
          const scansPath = `users/${currentUser.uid}/scans`;
          const q = query(
            collection(db, 'users', currentUser.uid, 'scans'),
            orderBy('createdAt', 'desc'),
            limit(10)
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
        setTotalScans(0);
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

          // Increment user's totalScans
          const userRef = doc(db, 'users', user.uid);
          try {
            await updateDoc(userRef, {
              totalScans: increment(1)
            });
            setTotalScans(prev => prev + 1);
          } catch (e) {
            console.error("Failed to update user totalScans:", e);
          }

          // Increment global counter for admin panel
          const statsRef = doc(db, 'stats', 'global');
          const today = new Date().toISOString().split('T')[0];
          const dailyStatsRef = doc(db, 'stats', `daily_${today}`);

          try {
            await updateDoc(statsRef, {
              totalScans: increment(1)
            });
          } catch (e) {
            await setDoc(statsRef, { totalScans: 1 }, { merge: true });
          }

          try {
            await updateDoc(dailyStatsRef, {
              count: increment(1),
              date: today
            });
          } catch (e) {
            await setDoc(dailyStatsRef, { count: 1, date: today }, { merge: true });
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
                {/* Level Badge */}
                <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--accent-teal-border)] px-4 py-2 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                  <div className="flex flex-col items-start">
                    <span className="text-[8px] font-mono text-[var(--accent-teal)] uppercase tracking-widest leading-none mb-1">Level</span>
                    <span className="text-sm font-bold leading-none">{userLevel}</span>
                  </div>
                  <div className="w-20 h-1.5 bg-[var(--bg-card-hover)] rounded-full overflow-hidden border border-[var(--border-color)]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(userXP / XP_PER_LEVEL) * 100}%` }}
                      className="h-full bg-[var(--accent-teal)] shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                    />
                  </div>
                </div>

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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-teal-soft)] border border-[var(--accent-teal-border)] text-[var(--accent-teal)] text-[10px] font-mono tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] animate-pulse" />
                {t('AuraScan Arena v2.0')}
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
              className="text-7xl md:text-9xl font-display font-extrabold tracking-tighter mb-4 md:mb-6 flex items-center justify-center gap-2"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--accent-teal)] via-[var(--text-primary)] to-[var(--accent-pink)]">
                Aura
              </span>
              <span className="relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-tr from-[var(--text-primary)] to-[var(--accent-teal)]">
                  Scan
                </span>
                <motion.div 
                  animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-4 w-3 h-3 bg-[var(--accent-teal)] rounded-full blur-[2px] shadow-[0_0_10px_var(--accent-teal)]" 
                />
              </span>
            </motion.h1>
          </header>
        )}

        <AnimatePresence mode="wait">
          {state === 'IDLE' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-4xl mx-auto space-y-12"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-pink)] rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
                
                <div className="relative medical-card p-8 md:p-12 text-center space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-[var(--text-primary)]">
                      {t('Ready to')} <span className="neon-text-teal">{t('Level Up')}</span>?
                    </h2>
                    <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto font-light">
                      {t('Step into the arena. One quick scan, and we\'ll map your biometric stats like a pro gamer.')}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    <div className="w-full max-w-sm space-y-2 text-left">
                      <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-secondary)] ml-1">{t('Choose Your Quest Focus')}</label>
                      <div className="relative group/select">
                        <select
                          value={focusArea}
                          onChange={(e) => setFocusArea(e.target.value)}
                          className="w-full appearance-none bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-2xl px-6 py-4 pr-12 text-base font-medium text-[var(--text-primary)] hover:border-[var(--accent-teal-border)] transition-all cursor-pointer focus:outline-none shadow-xl"
                        >
                          {focusAreas.map(area => (
                            <option key={area} value={area} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t(area)}</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)] group-hover/select:text-[var(--accent-teal)] transition-all">
                          <ChevronRight className="w-5 h-5 rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                      <button
                        onClick={() => setState('SCANNING')}
                        className="btn-primary w-full sm:w-auto px-12 py-5 group"
                      >
                        <span className="flex items-center justify-center gap-3 text-lg">
                          <Zap className="w-6 h-6 group-hover:scale-125 transition-transform" />
                          {t('Start Quest')}
                        </span>
                      </button>
                      <button
                        onClick={() => setShowOnboarding(true)}
                        className="btn-secondary w-full sm:w-auto px-12 py-5"
                      >
                        {t('How to Play')}
                      </button>
                    </div>
                  </div>

                  {/* Daily Insight Card */}
                  {latestScan && coachingMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 glass-panel border-[var(--accent-pink-border)] bg-[var(--accent-pink-soft)] text-left relative overflow-hidden group/insight"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/insight:opacity-10 transition-opacity">
                        <Brain className="w-24 h-24 text-[var(--accent-pink)]" />
                      </div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="p-3 bg-[var(--accent-pink-soft)] rounded-2xl border border-[var(--accent-pink-border)]">
                          <Brain className="w-6 h-6 text-[var(--accent-pink)]" />
                        </div>
                        <div>
                          <h4 className="text-[var(--accent-pink)] text-[10px] font-mono uppercase tracking-[0.3em] mb-2">{t('Daily Insight')}</h4>
                          <p className="text-lg text-[var(--text-primary)] font-medium leading-relaxed italic">
                            "{coachingMessage}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Game Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: <Activity className="w-6 h-6 text-[var(--accent-teal)]" />, title: t('Biometric Mapping'), desc: t('Scan 50+ facial markers to reveal your hidden health stats.') },
                  { icon: <Zap className="w-6 h-6 text-[var(--accent-amber)]" />, title: t('Instant XP'), desc: t('Get immediate feedback and level up your wellness journey.') },
                  { icon: <Sparkles className="w-6 h-6 text-[var(--accent-pink)]" />, title: t('Daily Quests'), desc: t('Complete AI-generated challenges to boost your health score.') }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="medical-card p-6 space-y-4 hover:scale-105 transition-transform group"
                  >
                    <div className="p-3 bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border-color)] w-fit group-hover:border-[var(--accent-teal-border)] transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">{feature.desc}</p>
                  </motion.div>
                ))}
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

          {state === 'ADMIN' && isAdmin && (
            <AdminPanel onBack={() => setState('IDLE')} />
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
