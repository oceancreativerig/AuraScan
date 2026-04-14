import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { HealthAnalysis } from '../services/geminiService';
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
      console.error("Error fetching history:", error);
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
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('Back to Scanner')}
        </button>
        <h2 className="text-xl md:text-2xl font-serif font-medium text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 md:w-6 md:h-6 text-teal-600" />
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
              <h3 className="text-base md:text-lg font-serif font-medium text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-teal-600" />
                {t('Wellness Trends')}
              </h3>
              <p className="text-[10px] md:text-xs text-slate-400 font-mono uppercase tracking-widest mt-1">{t('Score progression over time')}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-bold text-teal-600">
                {Math.round(scans.reduce((acc, s) => acc + s.overall_score, 0) / scans.length)}
              </span>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{t('Average Score')}</p>
            </div>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...scans].reverse().map(s => ({
                date: s.createdAt?.toDate ? format(s.createdAt.toDate(), 'MMM d') : t('Recent'),
                score: s.overall_score
              }))}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#0d9488' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0d9488" 
                  strokeWidth={2}
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
        <div className="text-center py-10 md:py-20 text-slate-400">{t('Loading history...')}</div>
      ) : scans.length === 0 ? (
        <div className="text-center py-10 md:py-20 medical-card rounded-3xl">
          <HeartPulse className="w-10 h-10 md:w-12 md:h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 text-sm md:text-base">{t('No scans found. Start your first health scan!')}</p>
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
              className="medical-card p-5 md:p-6 rounded-2xl cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-3xl font-bold text-slate-900">{scan.overall_score}</span>
                  <span className="text-xs text-slate-400 ml-1 uppercase tracking-wider">{t('Score')}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {scan.createdAt?.toDate ? scan.createdAt.toDate().toLocaleDateString() : t('Recent')}
                </div>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 italic font-light">
                "{scan.summary}"
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
