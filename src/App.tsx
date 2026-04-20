import React, { useState, useEffect, useRef } from 'react';
import { Scanner } from './components/Scanner';
import { Results } from './components/Results';
import { History } from './components/History';
import { FeedbackModal } from './components/FeedbackModal';
import { Onboarding } from './components/Onboarding';
import { CoachCard } from './components/CoachCard';
import { analyzeFaceHealth, translateAnalysis, generateCoachingMessage } from './services/auraService';
import { HealthAnalysis } from './types';
import { Shield, Sparkles, Activity, LogIn, LogOut, Clock, Sun, Moon, ChevronRight, Zap, Brain, ScanFace, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, getDoc, getDocFromServer, updateDoc, increment } from 'firebase/firestore';
import { useLanguage, languages } from './lib/i18n';
import { cn } from './lib/utils';

import { AdminPanel } from './components/AdminPanel';
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import { Footer } from './components/Footer';
import { Legal, LegalType } from './components/Legal';
import { FamilyCircle } from './components/FamilyCircle';
import { ExternalHealthData, ScanType } from './types';

type AppState = 'IDLE' | 'CALIBRATING' | 'SCANNING' | 'ANALYZING' | 'RESULTS' | 'HISTORY' | 'ADMIN' | 'ERROR' | 'FAMILY';

function CalibrationGuide({ onReady, t }: { onReady: () => void; t: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-teal)] via-[var(--accent-pink)] to-sky-500" />
      
      <div className="flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-[var(--accent-teal-soft)] flex items-center justify-center border border-[var(--accent-teal-border)]">
          <Shield className="w-8 h-8 text-[var(--accent-teal)]" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 px-3 py-1 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-full w-fit mx-auto">
             <span className="w-2 h-2 rounded-full bg-[var(--accent-teal)] animate-pulse" />
             <span className="text-[10px] font-mono font-bold text-[var(--accent-teal)] uppercase tracking-widest">{t('Calibration Step')}</span>
          </div>
          <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] tracking-tight">
            {t('Ensure Scientific Accuracy')}
          </h3>
        </div>

        <div className="space-y-4 w-full text-left">
          {[
            { icon: Sun, title: t('Natural Light'), desc: t('Face a window or bright area. Avoid harsh shadows or backlighting.') },
            { icon: Brain, title: t('Neutral Expression'), desc: t('Keep your face relaxed. Avoid smiling or squinting during the capture.') },
            { icon: ScanFace, title: t('Lens Distance'), desc: t('Hold your device at eye level, approximately 30-40cm from your face.') }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-4 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-color)]"
            >
              <div className="p-2 h-fit bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                <item.icon className="w-5 h-5 text-[var(--accent-teal)]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">{item.title}</h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-light">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReady}
          className="w-full py-5 bg-[var(--text-primary)] text-[var(--bg-card)] rounded-[1.5rem] font-display font-bold text-lg shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-3 mt-4"
        >
          {t('Ready to Scan')}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function Logo({ className = "", t }: { className?: string; t: any }) {
  return (
    <div className={cn("flex flex-col items-center gap-6 md:gap-8", className)}>
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
        {/* Core Biometric Iris Icon */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-teal)] to-sky-500 rounded-3xl rotate-45 opacity-10" />
        <div className="absolute inset-2 border-2 border-[var(--accent-teal)]/30 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-4 border border-[var(--accent-pink)]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <ScanFace className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-[var(--accent-teal)]" />
            <motion.div 
              animate={{ 
                height: ['0%', '100%', '0%'],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 right-0 h-[2px] bg-white/30 mix-blend-overlay shadow-[0_0_10px_var(--accent-teal)]" 
            />
          </div>
        </div>

        {/* Tactical Orbits */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent-pink)] rounded-full animate-pulse shadow-[0_0_15px_var(--accent-pink)]" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse delay-500 shadow-[0_0_15px_rgb(56,189,248)]" />
      </div>

      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-[-0.05em] text-[var(--text-primary)]">
          AURA<span className="font-light text-[var(--accent-teal)]">SCAN</span>
        </h1>
        <div className="flex items-center justify-center gap-3 mt-1">
          <div className="h-px w-4 bg-[var(--accent-teal)]/30" />
          <p className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.4em] text-[var(--text-secondary)]">
            {t('Biometric Intelligence')}
          </p>
          <div className="h-px w-4 bg-[var(--accent-teal)]/30" />
        </div>
      </div>
    </div>
  );
}

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
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: LegalType }>({ isOpen: false, type: 'privacy' });
  const [totalScans, setTotalScans] = useState(0);
  const [scanType, setScanType] = useState<ScanType>('general');
  const [wearableSync, setWearableSync] = useState(false);
  const [mockExternalData, setMockExternalData] = useState<ExternalHealthData | undefined>(undefined);
  const [analysisProgress, setAnalysisProgress] = useState(0);
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
  const [activeChallengeScanId, setActiveChallengeScanId] = useState<string | null>(null);
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
              const scans = snapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                  ...data, 
                  id: doc.id,
                  createdAt: data.createdAt?.toDate() || new Date()
                } as any;
              });
              setLatestScan(scans[0]);
              setScanHistory(scans);

              // Find current active challenge (most recent scan within 7 days that has activity)
              const now = new Date();
              const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
              
              const activeScan = scans.find(s => {
                const date = s.createdAt;
                return date >= sevenDaysAgo && s.challenge;
              });

              if (activeScan) {
                setActiveChallengeScanId(activeScan.id);
              }
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

  // Translate analysis when language changes
  useEffect(() => {
    let isMounted = true;
    const updateTranslations = async () => {
      // 1. Current scan translation
      if (analysis && state === 'RESULTS' && analysis.language !== language) {
        try {
          const translated = await translateAnalysis(analysis, language);
          if (isMounted) setAnalysis({ ...translated, language });
        } catch (err) {
          console.error("Translation error:", err);
        }
      }
      
      // 2. Latest scan translation (for IDLE dashboard)
      if (latestScan && state === 'IDLE' && latestScan.language !== language) {
        try {
          const translated = await translateAnalysis(latestScan, language);
          if (isMounted) setLatestScan({ ...translated, language, id: latestScan.id });
        } catch (err) {
          console.error("Latest scan translation error:", err);
        }
      }
    };
    
    updateTranslations();
    return () => { isMounted = false; };
  }, [language, state, analysis?.id, latestScan?.id]); // Refined dependencies

  const handleCapture = async (base64Image: string) => {
    setState('ANALYZING');
    setAnalysisProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Progress simulation
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev < 30) return prev + Math.random() * 10;
        if (prev < 70) return prev + Math.random() * 5;
        if (prev < 90) return prev + Math.random() * 2;
        return prev + 0.1; // Slow crawl near the end
      });
    }, 400);

    try {
      const result = await analyzeFaceHealth(
        base64Image, 
        language, 
        focusArea, 
        scanType, 
        wearableSync ? { 
          steps: Math.floor(Math.random() * 8000) + 2000, 
          sleepHours: 7.2, 
          heartRate: 68 
        } : undefined
      );
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Artificial delay to let user see 100%
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
    } catch (err: any) {
      console.error(err);
      let msg = t("Analysis failed. Please try again.");
      
      if (err.message?.includes("high demand") || err.message?.includes("503") || err.status === 503) {
        msg = t("The AI engine is currently experiencing high demand. Please wait a few moments and try again.");
      } else if (err.message?.includes("unavailable") || err.status === 503) {
        msg = t("AI Analysis is temporarily unavailable. Our engineers are on it.");
      } else if (err.message) {
        msg = err.message;
      }
      
      setError(msg);
      setState('ERROR');
    }
  };

  const handleUpdateChallenge = async (scanId: string, dayIndex: number, completed: boolean) => {
    let targetAnalysis: HealthAnalysis | null = null;
    let isCurrent = false;

    if (currentScanId === scanId && analysis) {
      targetAnalysis = { ...analysis };
      isCurrent = true;
    } else {
      const histScan = scanHistory.find(s => s.id === scanId);
      if (histScan) {
        targetAnalysis = { ...histScan };
      }
    }

    if (!targetAnalysis) return;
    
    const updatedAnalysis = { ...targetAnalysis };
    if (!updatedAnalysis.challenge || !updatedAnalysis.challenge.days || !updatedAnalysis.challenge.days[dayIndex]) return;
    
    updatedAnalysis.challenge.days[dayIndex].completed = completed;
    
    if (isCurrent) {
      setAnalysis(updatedAnalysis);
    } else {
      setScanHistory(prev => prev.map(s => s.id === scanId ? { ...s, challenge: updatedAnalysis.challenge } : s));
    }

    if (user) {
      const scanPath = `users/${user.uid}/scans/${scanId}`;
      try {
        const scanRef = doc(db, 'users', user.uid, 'scans', scanId);
        await updateDoc(scanRef, { challenge: updatedAnalysis.challenge });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, scanPath);
      }
    }
  };

  const reset = () => {
    setAnalysis(null);
    setCurrentScanId(null);
    setError(null);
    setAnalysisProgress(0);
    setState('CALIBRATING');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-teal-500/30 transition-colors duration-300 overflow-x-hidden">
      <AnimatePresence>
        {!authReady && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--bg-main)] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-8 text-center max-w-xs px-6">
              <div className="relative w-24 h-24">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-t-[var(--accent-teal)] border-r-transparent border-b-transparent border-l-transparent rounded-full shadow-[0_0_15px_rgba(45,212,191,0.3)]"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border border-[var(--border-color)] group-hover:border-[var(--accent-teal-border)] transition-colors rounded-full flex items-center justify-center bg-[var(--bg-card-hover)]/30 backdrop-blur-sm"
                >
                  <Activity className="w-8 h-8 text-[var(--accent-teal)] animate-pulse" />
                </motion.div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-mono uppercase tracking-[0.4em] text-[var(--text-primary)] animate-pulse">
                  {t('Calibrating Aura Engine')}
                </h3>
                <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest opacity-60">
                  {t('Initializing Biometric Neural Stream...')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden isolating">
        {/* Primary Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[var(--accent-teal)]/10 blur-[140px] rounded-full opacity-40" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -60, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-[var(--accent-pink)]/10 blur-[140px] rounded-full opacity-40" 
        />
        
        {/* Accent Floaters */}
        <motion.div 
          animate={{ 
            y: [0, -100, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[15%] w-32 h-32 bg-sky-400/20 blur-[60px] rounded-full"
        />

        {/* Dynamic Pattern Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(var(--border-color)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.15]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-color)_1px,transparent_1px)] bg-[size:128px_128px] opacity-[0.05]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--bg-main)_100%)] opacity-60" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16 flex flex-col items-center min-h-screen">
        {/* Top Navigation */}
        <nav className="w-full flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 md:mb-20">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setState('IDLE')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all text-xs font-semibold shadow-2xl text-[var(--text-primary)] active:scale-95"
              >
                <div className="p-1 bg-[var(--accent-teal-soft)] rounded-lg">
                  <Activity className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
                </div>
                {t('Home')}
              </button>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-xl active:scale-90"
                title={theme === 'light' ? t('Switch to Dark Mode') : t('Switch to Light Mode')}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 shadow-[0_0_10px_var(--accent-amber-soft)]" />}
              </button>
            </div>

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
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
                <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--accent-teal-border)] px-4 py-2 rounded-2xl shadow-xl">
                  <div className="flex flex-col items-start">
                    <span className="text-[8px] font-mono text-[var(--accent-teal)] uppercase tracking-widest leading-none mb-1">Level</span>
                    <span className="text-sm font-bold leading-none">{userLevel}</span>
                  </div>
                  <div className="w-16 h-1 bg-[var(--bg-card-hover)] rounded-full overflow-hidden border border-[var(--border-color)]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(userXP / XP_PER_LEVEL) * 100}%` }}
                      className="h-full bg-[var(--accent-teal)]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setState('HISTORY')}
                    className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all shadow-xl text-[var(--text-primary)] active:scale-95"
                    title={t('History')}
                  >
                    <Clock className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setState('FAMILY')}
                    className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent-pink-border)] text-[var(--accent-pink)] hover:bg-[var(--accent-pink-soft)] transition-all shadow-xl active:scale-95"
                    title={t('Family Circle')}
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  
                  {isAdmin && (
                    <button
                      onClick={() => setState('ADMIN')}
                      className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent-teal-border)] text-[var(--accent-teal)] hover:bg-[var(--accent-teal-soft)] transition-all shadow-xl active:scale-95"
                      title={t('Admin')}
                    >
                      <Shield className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border-color)] pl-3 pr-4 py-1.5 rounded-2xl shadow-xl">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-[var(--border-color)]" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-teal-soft)] flex items-center justify-center text-[var(--accent-teal)] border border-[var(--accent-teal-border)]">
                      <Users className="w-4 h-4" />
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-all text-xs font-bold uppercase tracking-wider active:scale-95"
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
        {state !== 'IDLE' && state !== 'HISTORY' && state !== 'ADMIN' && (
          <header className="text-center mb-16 md:mb-24 mt-4 md:mt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-teal-soft)] border border-[var(--accent-teal-border)] text-[var(--accent-teal)] text-[10px] font-mono tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(45,212,191,0.1)] mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] animate-pulse" />
                {t('AuraScan Arena v2.0')}
              </div>
              
              <Logo t={t} />
            </motion.div>
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
                
                <div className="relative medical-card p-6 md:p-12 text-center space-y-8 overflow-hidden">
                  <div className="absolute top-0 right-0 w-[40%] h-full bg-[var(--accent-teal)]/[0.02] -skew-x-12 translate-x-1/2" />
                  
                  {/* Hero Visual: Simple Clean Logo */}
                  <div className="relative flex items-center justify-center py-4 md:py-8">
                     <Logo t={t} />
                  </div>

                  <div className="space-y-4 max-w-2xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-7xl font-display font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
                      {t('Your Biometric')} <span className="neon-text-teal">{t('Truth')}</span> {t('Revealed')}.
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm md:text-xl max-w-xl mx-auto font-light leading-relaxed">
                      {t('Step into the future of wellness tracking. Our AI-driven engine maps 50+ facial markers to generate your unique Vitality Score in seconds.')}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    {/* Routine Selection */}
                    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-2">
                       {([
                         { id: 'morning', icon: <Sun className="w-4 h-4" />, label: t('Morning') },
                         { id: 'general', icon: <Activity className="w-4 h-4" />, label: t('Daily') },
                         { id: 'evening', icon: <Moon className="w-4 h-4" />, label: t('Evening') }
                       ] as const).map((mode) => (
                         <button
                           key={mode.id}
                           onClick={() => setScanType(mode.id)}
                           className={cn(
                             "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                             scanType === mode.id 
                               ? "bg-[var(--accent-teal-soft)] border-[var(--accent-teal-border)] text-[var(--accent-teal)] shadow-lg"
                               : "bg-[var(--bg-card-hover)] border-[var(--border-color)] text-[var(--text-secondary)] opacity-60"
                           )}
                         >
                           {mode.icon}
                           <span className="text-[9px] font-mono uppercase font-bold">{mode.label}</span>
                         </button>
                       ))}
                    </div>

                    {/* Wearable Sync Toggle */}
                    <div className="w-full max-w-sm">
                       <button 
                        onClick={() => setWearableSync(!wearableSync)}
                        className={cn(
                          "w-full p-4 rounded-2xl border flex items-center justify-between group transition-all",
                          wearableSync 
                            ? "bg-[var(--accent-amber-soft)] border-[var(--accent-amber-border)] text-[var(--accent-amber)]" 
                            : "bg-[var(--bg-card-hover)] border-[var(--border-color)] text-[var(--text-secondary)] opacity-60"
                        )}
                       >
                         <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl transition-colors", wearableSync ? "bg-[var(--accent-amber)]/20" : "bg-[var(--bg-card)]")}>
                               <Zap className={cn("w-4 h-4", wearableSync && "animate-pulse")} />
                            </div>
                            <div className="text-left">
                               <p className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">{t('Aura-Sync')}</p>
                               <p className="text-[9px] opacity-70">{wearableSync ? t('Connected to Wearables') : t('Link Health Data')}</p>
                            </div>
                         </div>
                         <div className={cn("w-10 h-5 rounded-full relative transition-colors", wearableSync ? "bg-[var(--accent-amber)]" : "bg-[var(--border-color)]")}>
                            <motion.div 
                              animate={{ x: wearableSync ? 20 : 2 }}
                              className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                            />
                         </div>
                       </button>
                    </div>

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
                        onClick={() => setState('CALIBRATING')}
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

          {state === 'FAMILY' && (
            <FamilyCircle onBack={() => setState('IDLE')} />
          )}

          {state === 'CALIBRATING' && (
            <CalibrationGuide onReady={() => setState('SCANNING')} t={t} />
          )}

          {(state === 'SCANNING' || state === 'ANALYZING') && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <Scanner 
                onCapture={handleCapture} 
                isAnalyzing={state === 'ANALYZING'} 
                analysisProgress={analysisProgress}
              />
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setState('IDLE');
                    setAnalysisProgress(0);
                  }}
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
              activeChallengeScanId={activeChallengeScanId}
              scanHistory={scanHistory}
              onSetActiveChallenge={(id) => setActiveChallengeScanId(id)}
              currentScanId={currentScanId}
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

        <Footer onOpenLegal={(type) => setLegalModal({ isOpen: true, type })} />
      </main>

      <FeedbackModal />
      {showOnboarding && <Onboarding onComplete={handleCompleteOnboarding} />}
      <Legal 
        isOpen={legalModal.isOpen} 
        type={legalModal.type} 
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })} 
      />
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
