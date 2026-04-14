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
  onViewScan: (scan: HealthAnalysis) => void;
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
      className="w-full max-w-4xl mx-auto space-y-8 pb-20"
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('Back to Scanner')}
        </button>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-cyan-400" />
          {t('Scan History')}
        </h2>
      </div>

      {scans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-[2.5rem] mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                {t('Wellness Trends')}
              </h3>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">{t('Score progression over time')}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-cyan-400">
                {Math.round(scans.reduce((acc, s) => acc + s.overall_score, 0) / scans.length)}
              </span>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{t('Average Score')}</p>
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
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #3f3f46', 
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#22d3ee" 
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
        <div className="text-center py-20 text-zinc-400">{t('Loading history...')}</div>
      ) : scans.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <HeartPulse className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">{t('No scans found. Start your first health scan!')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scans.map((scan, idx) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onViewScan(scan)}
              className="glass-panel p-6 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-3xl font-bold text-white">{scan.overall_score}</span>
                  <span className="text-xs text-zinc-400 ml-1 uppercase tracking-wider">{t('Score')}</span>
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  {scan.createdAt?.toDate ? scan.createdAt.toDate().toLocaleDateString() : t('Recent')}
                </div>
              </div>
              <p className="text-sm text-zinc-300 line-clamp-2 italic font-light">
                "{scan.summary}"
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
