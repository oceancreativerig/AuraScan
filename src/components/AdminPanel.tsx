import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';
import { HealthAnalysis } from "../types";
import { Shield, MessageSquare, Users, Activity, ArrowLeft, Trash2, Sparkles } from 'lucide-react';
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

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feedback' | 'users'>('feedback');
  const [totalScans, setTotalScans] = useState(0);
  const [dailyScans, setDailyScans] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Fetch Feedback
        const feedbackPath = 'feedback';
        const feedbackQuery = query(collection(db, feedbackPath), orderBy('createdAt', 'desc'), limit(50));
        let feedbackSnapshot;
        try {
          feedbackSnapshot = await getDocs(feedbackQuery);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, feedbackPath);
        }
        
        if (feedbackSnapshot) {
          const feedbackData = feedbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Feedback[];
          setFeedbacks(feedbackData);
        }

        // Fetch Users (Recent)
        const usersPath = 'users';
        const usersQuery = query(collection(db, usersPath), orderBy('createdAt', 'desc'), limit(50));
        let usersSnapshot;
        try {
          usersSnapshot = await getDocs(usersQuery);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, usersPath);
        }
        
        if (usersSnapshot) {
          const usersData = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as UserStat[];
          setUsers(usersData);
        }

        // Fetch Total Scans from stats/global
        const statsRef = doc(db, 'stats', 'global');
        const statsDoc = await getDoc(statsRef);
        if (statsDoc.exists()) {
          setTotalScans(statsDoc.data().totalScans || 0);
        }

        // Fetch Daily Scans
        const today = new Date().toISOString().split('T')[0];
        const dailyStatsRef = doc(db, 'stats', `daily_${today}`);
        const dailyDoc = await getDoc(dailyStatsRef);
        if (dailyDoc.exists()) {
          setDailyScans(dailyDoc.data().count || 0);
        }

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const FREE_TIER_LIMIT = 1500; // Gemini Flash Free Tier RPD
  const remainingQuota = Math.max(0, FREE_TIER_LIMIT - dailyScans);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto space-y-6 md:space-y-8 pb-10 md:pb-20"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-mono uppercase tracking-widest">{t('Back to Dashboard')}</span>
        </button>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] flex items-center gap-3">
          <Shield className="w-6 h-6 text-[var(--accent-teal)]" />
          {t('Admin Control Panel')}
        </h2>
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
        </div>
      )}
    </motion.div>
  );
};
