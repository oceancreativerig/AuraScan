import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { HealthAnalysis } from '../services/auraService';
import { motion } from 'motion/react';
import { Clock, ArrowLeft, HeartPulse, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { useLanguage } from '../lib/i18n';

interface HistoryProps {
  onBack: () => void;
  onViewScan: (scan: HealthAnalysis & { id: string }) => void;
}

interface SavedScan extends HealthAnalysis {
  id: string;
  createdAt: any;
}

export const History: React.FC<HistoryProps> = ({ onBack, onViewScan }) => {
  const [scans, setScans] = useState<SavedScan[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (!auth.currentUser) return;

    const scansPath = `users/${auth.currentUser.uid}/scans`;
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'scans'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scanData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedScan[];
      setScans(scanData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, scansPath);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6 md:space-y-8 pb-10 md:pb-20"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-mono uppercase tracking-widest">{t('Back to Scanner')}</span>
        </button>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] flex items-center gap-3">
          <Clock className="w-6 h-6 text-[var(--accent-teal)]" />
          {t('Scan History')}
        </h2>
      </div>

      {scans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="medical-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] mb-6 md:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-display font-bold text-[var(--text-primary)] flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-[var(--accent-teal)]" />
                {t('Wellness Trends')}
              </h3>
              <p className="text-[10px] md:text-xs text-[var(--text-secondary)] font-mono uppercase tracking-[0.2em] mt-1.5">{t('Score progression over time')}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-3xl font-display font-bold text-[var(--accent-teal)] drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
                {Math.round(scans.reduce((acc, s) => acc + s.overall_score, 0) / scans.length)}
              </span>
              <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-[0.2em]">{t('Average Score')}</p>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...scans].reverse().map(s => ({
                date: s.createdAt?.toDate ? format(s.createdAt.toDate(), 'MMM d') : t('Recent'),
                score: s.overall_score
              }))}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-[var(--border-color)]" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="currentColor" 
                  className="text-[var(--text-secondary)]"
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="currentColor" 
                  className="text-[var(--text-secondary)]"
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#2dd4bf' }}
                  labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2dd4bf" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-10 md:py-20 text-[var(--text-secondary)] font-mono uppercase tracking-widest animate-pulse">{t('Loading history...')}</div>
      ) : scans.length === 0 ? (
        <div className="text-center py-10 md:py-20 medical-card rounded-3xl">
          <HeartPulse className="w-12 h-12 text-[var(--border-color)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] text-sm md:text-base font-light">{t('No scans found. Start your first health scan!')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scans.map((scan, idx) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onViewScan(scan)}
              className="medical-card p-6 md:p-8 rounded-2xl cursor-pointer hover:border-[var(--accent-teal-border)] transition-all group"
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <span className="text-4xl font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors">{scan.overall_score}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] ml-2 uppercase tracking-[0.2em] font-mono">{t('Score')}</span>
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest bg-[var(--bg-card-hover)] px-2 py-1 rounded border border-[var(--border-color)]">
                  {scan.createdAt?.toDate ? scan.createdAt.toDate().toLocaleDateString() : t('Recent')}
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2 italic font-light leading-relaxed">
                "{scan.summary}"
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent-teal)] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{t('View Detailed Report')}</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
