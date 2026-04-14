import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { HealthAnalysis } from '../services/geminiService';
import { motion } from 'motion/react';
import { Clock, ArrowLeft, HeartPulse } from 'lucide-react';

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
          Back to Scanner
        </button>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-cyan-400" />
          Scan History
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-400">Loading history...</div>
      ) : scans.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <HeartPulse className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No scans found. Start your first health scan!</p>
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
                  <span className="text-xs text-zinc-400 ml-1 uppercase tracking-wider">Score</span>
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  {scan.createdAt?.toDate ? scan.createdAt.toDate().toLocaleDateString() : 'Recent'}
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
