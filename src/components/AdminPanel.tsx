import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';
import { Shield, MessageSquare, Users, Activity, ArrowLeft, Trash2 } from 'lucide-react';
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

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto space-y-6 md:space-y-8 pb-10 md:pb-20"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('Back to Dashboard')}
        </button>
        <h2 className="text-xl md:text-2xl font-serif font-medium text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 md:w-6 md:h-6 text-teal-600" />
          {t('Admin Control Panel')}
        </h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="medical-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
            <MessageSquare className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('Total Feedback')}</p>
            <p className="text-2xl font-bold text-slate-900">{feedbacks.length}</p>
          </div>
        </div>
        <div className="medical-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
            <Users className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('Recent Users')}</p>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'feedback' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t('User Feedback')}
          {activeTab === 'feedback' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'users' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t('Recent Users')}
          {activeTab === 'users' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-slate-600 flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 animate-pulse text-teal-500" />
          {t('Loading admin data...')}
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'feedback' && (
            feedbacks.length === 0 ? (
              <p className="text-center py-10 text-slate-600">{t('No feedback received yet.')}</p>
            ) : (
              feedbacks.map((fb) => (
                <div key={fb.id} className="medical-card p-5 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{fb.userEmail}</span>
                      {fb.platform && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider border border-slate-200">
                          {fb.platform}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {fb.createdAt?.toDate ? fb.createdAt.toDate().toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{fb.text}</p>
                </div>
              ))
            )
          )}

          {activeTab === 'users' && (
            users.length === 0 ? (
              <p className="text-center py-10 text-slate-600">{t('No users found.')}</p>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">{t('Email')}</th>
                      <th className="px-6 py-4 font-medium">{t('Joined')}</th>
                      <th className="px-6 py-4 font-medium">{t('User ID')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{u.email || 'Anonymous'}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                          {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{u.id}</td>
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
