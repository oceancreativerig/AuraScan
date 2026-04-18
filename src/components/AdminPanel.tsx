import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, limit, doc, getDoc, onSnapshot, addDoc, serverTimestamp, increment, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';
import { HealthAnalysis } from "../types";
import { Shield, MessageSquare, Users, Activity, ArrowLeft, Trash2, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface AdminPanelProps {
  onBack: () => void;
}

interface Feedback {
  id: string;
  text: string;
  userEmail: string;
  createdAt: any;
  platform?: string;
}

interface UserStat {
  id: string;
  email: string;
  createdAt: any;
}

interface ApiLog {
  id: string;
  operation: string;
  environment: string;
  userId: string;
  timestamp: any;
  hostname: string;
}

interface ApiStats {
  totalCalls: number;
  calls_analysis: number;
  calls_translation: number;
  calls_coaching: number;
  "env_ai-studio": number;
  env_vercel: number;
  env_github: number;
  env_other: number;
  lastCallAt: any;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<UserStat[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feedback' | 'users' | 'usage'>('feedback');
  const [totalScans, setTotalScans] = useState(0);
  const [dailyScans, setDailyScans] = useState(0);
  const { t } = useLanguage();

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAdminData = () => {
    // With onSnapshot, we don't strictly need to fetch, 
    // but we can use this to show the user we are "refreshing" the connection
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    setLoading(true);
    
    // Real-time Feedback
    const feedbackQuery = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribeFeedback = onSnapshot(feedbackQuery, (snapshot) => {
      setFeedbacks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[]);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'feedback'));

    // Real-time Users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserStat[]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    // Real-time Global Stats
    const statsRef = doc(db, 'stats', 'global');
    const unsubscribeGlobalStats = onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        setTotalScans(doc.data().totalScans || 0);
      }
    });

    // Real-time Daily Scans
    const today = new Date().toISOString().split('T')[0];
    const dailyStatsRef = doc(db, 'stats', `daily_${today}`);
    const unsubscribeDailyStats = onSnapshot(dailyStatsRef, (doc) => {
      if (doc.exists()) {
        setDailyScans(doc.data().count || 0);
      }
    });

    // Real-time API Stats
    const apiStatsRef = doc(db, 'admin', 'stats');
    const unsubscribeApiStats = onSnapshot(apiStatsRef, (doc) => {
      if (doc.exists()) {
        setApiStats(doc.data() as ApiStats);
        setLastUpdated(new Date());
      }
    });

    // Real-time API Logs
    const logsQuery = query(collection(db, 'api_logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      setApiLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ApiLog[]);
    });

    return () => {
      unsubscribeFeedback();
      unsubscribeUsers();
      unsubscribeGlobalStats();
      unsubscribeDailyStats();
      unsubscribeApiStats();
      unsubscribeLogs();
    };
  }, []);

  const FREE_TIER_LIMIT = 1500; // Gemini Flash Free Tier RPD
  const remainingQuota = Math.max(0, FREE_TIER_LIMIT - dailyScans);

  const testTracking = async () => {
    try {
      // We can't easily import trackApiUsage here without circular deps or export issues
      // So we'll just manually trigger a log
      await addDoc(collection(db, 'api_logs'), {
        operation: 'test',
        environment: window.location.hostname.includes('vercel.app') ? 'vercel' : 'other',
        userId: auth.currentUser?.uid || 'anonymous',
        timestamp: serverTimestamp(),
        hostname: window.location.hostname
      });
      
      const statsRef = doc(db, 'admin', 'stats');
      await setDoc(statsRef, {
        totalCalls: increment(1),
        env_other: increment(1),
        lastCallAt: serverTimestamp()
      }, { merge: true });
      
      alert("Test log sent! Check the Usage Stats tab in a few seconds.");
    } catch (err) {
      console.error("Test tracking failed:", err);
      alert("Failed to send test log. Check console.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto space-y-6 md:space-y-8 pb-10 md:pb-20"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-mono uppercase tracking-widest">{t('Back to Dashboard')}</span>
          </button>
          <div className="h-6 w-px bg-[var(--border-color)] hidden sm:block" />
          <div className="flex flex-col hidden sm:flex">
            <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">{t('Last Updated')}</p>
            <p className="text-xs font-mono text-[var(--text-primary)]">{lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)] flex items-center gap-2 mr-auto sm:mr-0">
            <Shield className="w-5 h-5 text-[var(--accent-teal)]" />
            {t('Admin')}
          </h2>
          <button
            onClick={testTracking}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-all shadow-lg"
          >
            <Activity className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest">{t('Test')}</span>
          </button>
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-all disabled:opacity-50 shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-mono uppercase tracking-widest">{t('Refresh')}</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="medical-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-[var(--accent-teal-soft)] rounded-xl border border-[var(--accent-teal-border)]">
            <MessageSquare className="w-6 h-6 text-[var(--accent-teal)]" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest">{t('Feedback')}</p>
            <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{feedbacks.length}</p>
          </div>
        </div>
        <div className="medical-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20">
            <Users className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest">{t('Users')}</p>
            <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{users.length}</p>
          </div>
        </div>
        <div className="medical-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Activity className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest">{t('Total Scans')}</p>
            <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{totalScans}</p>
          </div>
        </div>
        <div className="medical-card p-6 rounded-2xl flex items-center gap-4 border-teal-500/30 bg-teal-500/5">
          <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-6 h-6 text-teal-500" />
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest">{t('API Today')}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{dailyScans}</p>
              <p className="text-[10px] text-[var(--text-secondary)] font-mono">/ {FREE_TIER_LIMIT}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quota Progress */}
      <div className="medical-card p-6 rounded-2xl mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--accent-teal)]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-primary)]">{t('Daily API Quota Balance')}</span>
          </div>
          <span className="text-xs font-mono text-[var(--text-secondary)]">{t('Remaining')}: {remainingQuota}</span>
        </div>
        <div className="h-2 w-full bg-[var(--bg-card-hover)] rounded-full overflow-hidden border border-[var(--border-color)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(dailyScans / FREE_TIER_LIMIT) * 100}%` }}
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
          />
        </div>
        <p className="mt-3 text-[10px] text-[var(--text-secondary)] italic">
          {t('Note: Based on Gemini Flash Free Tier limit of 1,500 requests per day.')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[var(--border-color)] mb-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-4 px-2 text-xs font-mono uppercase tracking-[0.2em] transition-colors relative whitespace-nowrap ${activeTab === 'feedback' ? 'text-[var(--accent-teal)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          {t('User Feedback')}
          {activeTab === 'feedback' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-teal)] shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-2 text-xs font-mono uppercase tracking-[0.2em] transition-colors relative whitespace-nowrap ${activeTab === 'users' ? 'text-[var(--accent-teal)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          {t('Recent Users')}
          {activeTab === 'users' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-teal)] shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`pb-4 px-2 text-xs font-mono uppercase tracking-[0.2em] transition-colors relative whitespace-nowrap ${activeTab === 'usage' ? 'text-[var(--accent-teal)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          {t('Usage Stats')}
          {activeTab === 'usage' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-teal)] shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-[var(--text-secondary)] flex flex-col items-center gap-4 font-mono uppercase tracking-widest">
          <Activity className="w-8 h-8 animate-pulse text-[var(--accent-teal)]" />
          {t('Loading admin data...')}
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'feedback' && (
            feedbacks.length === 0 ? (
              <p className="text-center py-10 text-[var(--text-secondary)] font-light italic">{t('No feedback received yet.')}</p>
            ) : (
              feedbacks.map((fb) => (
                <div key={fb.id} className="medical-card p-6 rounded-2xl hover:border-[var(--accent-teal-border)] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[var(--text-primary)] text-sm">{fb.userEmail}</span>
                      {fb.platform && (
                        <span className="text-[9px] bg-[var(--bg-card-hover)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full uppercase tracking-[0.2em] border border-[var(--border-color)]">
                          {fb.platform}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest">
                      {fb.createdAt?.toDate ? fb.createdAt.toDate().toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap font-light">{fb.text}</p>
                </div>
              ))
            )
          )}

          {activeTab === 'users' && (
            users.length === 0 ? (
              <p className="text-center py-10 text-[var(--text-secondary)] font-light italic">{t('No users found.')}</p>
            ) : (
              <div className="bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-card)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-mono uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="px-6 py-5 font-medium">{t('Email')}</th>
                      <th className="px-6 py-5 font-medium">{t('Joined')}</th>
                      <th className="px-6 py-5 font-medium">{t('User ID')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[var(--bg-card)] transition-colors">
                        <td className="px-6 py-5 font-medium text-[var(--text-primary)]">{u.email || 'Anonymous'}</td>
                        <td className="px-6 py-5 text-[var(--text-secondary)] font-mono text-xs">
                          {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-5 text-[var(--text-secondary)] font-mono text-[10px] tracking-tight">{u.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {activeTab === 'usage' && (
            <div className="space-y-8">
              {/* Daily Quota Monitor */}
              <div className="medical-card p-6 md:p-8 rounded-[2rem] border-2 border-[var(--accent-teal)]/30 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-card-hover)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-teal)]/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[var(--accent-teal-soft)] rounded-xl text-[var(--accent-teal)] border border-[var(--accent-teal-border)]">
                        <Zap className="w-5 h-5 fill-current" />
                      </div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                        {t('Free Tier Pulse')}
                      </h3>
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)] text-sm max-w-md leading-relaxed font-light">
                        {t('Monitoring your Gemini Flash Free Tier limits. This tracks API calls shared across your Vercel, GitHub, and AI Studio deployments. Global limits apply across all your Google AI Studio projects.')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Shield className="w-3 h-3 text-[var(--accent-teal)]" />
                        <span className="text-[10px] font-mono text-[var(--accent-teal)] uppercase tracking-wider">{t('Secure Tracking Active')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-sm space-y-3">
                    <div className="flex justify-between items-end mb-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.2em]">{t('Today\'s Usage')}</span>
                        <span className="text-3xl font-display font-bold text-[var(--accent-teal)]">
                          {(apiStats as any)?.[`daily_${new Date().toISOString().split('T')[0]}`] || 0}
                          <span className="text-lg text-[var(--text-secondary)] font-normal ml-2">/ 1,500</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--accent-teal)] font-bold px-2 py-1 bg-[var(--accent-teal-soft)] rounded-md border border-[var(--accent-teal-border)]">
                        {Math.round((( (apiStats as any)?.[`daily_${new Date().toISOString().split('T')[0]}`] || 0) / 1500) * 100)}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-[var(--border-color)] rounded-full overflow-hidden p-0.5 border border-[var(--border-color)]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (((apiStats as any)?.[`daily_${new Date().toISOString().split('T')[0]}`] || 0) / 1500) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-pink)] rounded-full relative shadow-[0_0_15px_var(--accent-teal-soft)]"
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-pulse" />
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-widest pt-1 px-1">
                      <span>0 Req/Day</span>
                      <span className="text-[var(--accent-pink-soft)]">Critical Limit: 1,500 Req/Day</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Debug Info */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-[10px] font-mono text-amber-500/70 uppercase tracking-widest leading-none mb-1">Current Environment</p>
                    <p className="text-xs font-mono text-amber-500 font-bold">{window.location.hostname}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-amber-500/70 uppercase tracking-widest leading-none mb-1">Status</p>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-mono text-amber-500">{apiStats ? 'Live' : 'Connecting...'}</p>
                  </div>
                </div>
              </div>

              {/* Environment Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="medical-card p-6 rounded-2xl">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--accent-teal)]" />
                    {t('Environment Breakdown')}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'AI Studio', key: 'env_ai-studio', color: 'bg-teal-500' },
                      { label: 'Vercel', key: 'env_vercel', color: 'bg-blue-500' },
                      { label: 'GitHub', key: 'env_github', color: 'bg-purple-500' },
                      { label: 'Other', key: 'env_other', color: 'bg-gray-500' }
                    ].map((env) => (
                      <div key={env.key} className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-[var(--text-secondary)]">{env.label}</span>
                          <span className="text-[var(--text-primary)]">{(apiStats as any)?.[env.key] || 0}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${apiStats?.totalCalls ? (((apiStats as any)?.[env.key] || 0) / apiStats.totalCalls) * 100 : 0}%` }}
                            className={`h-full ${env.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="medical-card p-6 rounded-2xl">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--accent-pink)]" />
                    {t('Operation Breakdown')}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Analysis', key: 'calls_analysis', color: 'bg-pink-500' },
                      { label: 'Translation', key: 'calls_translation', color: 'bg-amber-500' },
                      { label: 'Coaching', key: 'calls_coaching', color: 'bg-emerald-500' }
                    ].map((op) => (
                      <div key={op.key} className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-[var(--text-secondary)]">{op.label}</span>
                          <span className="text-[var(--text-primary)]">{(apiStats as any)?.[op.key] || 0}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${apiStats?.totalCalls ? (((apiStats as any)?.[op.key] || 0) / apiStats.totalCalls) * 100 : 0}%` }}
                            className={`h-full ${op.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* API Logs Table */}
              <div className="bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--text-primary)]">{t('Recent API Activity')}</h3>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-card)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-mono uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="px-6 py-5 font-medium">{t('Time')}</th>
                      <th className="px-6 py-5 font-medium">{t('Operation')}</th>
                      <th className="px-6 py-5 font-medium">{t('Environment')}</th>
                      <th className="px-6 py-5 font-medium">{t('User')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {apiLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[var(--bg-card)] transition-colors">
                        <td className="px-6 py-5 text-[var(--text-secondary)] font-mono text-xs">
                          {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                            log.operation === 'analysis' ? 'border-pink-500/30 text-pink-500 bg-pink-500/5' :
                            log.operation === 'translation' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' :
                            'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                          }`}>
                            {log.operation}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-[var(--text-primary)] font-mono text-xs">{log.environment}</td>
                        <td className="px-6 py-5 text-[var(--text-secondary)] font-mono text-[10px] truncate max-w-[150px]">{log.userId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
