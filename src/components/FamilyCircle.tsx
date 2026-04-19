import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Shield, Bell, ArrowLeft, Heart, Share2, Trash2 } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, where } from 'firebase/firestore';
import { useLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';

interface FamilyMember {
  id: string;
  email: string;
  name: string;
  lastScore?: number;
  status?: string;
}

interface FamilyCircleProps {
  onBack: () => void;
}

export const FamilyCircle: React.FC<FamilyCircleProps> = ({ onBack }) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!auth.currentUser) return;

    // In a real app, this would be a more complex relationship table
    // For this demo, we'll track a "family" collection where users are linked
    const q = query(
      collection(db, 'family_members'),
      where('associatedUserId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FamilyMember[];
      setMembers(data);
    });

    return () => unsubscribe();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !auth.currentUser) return;

    setIsInviting(true);
    try {
      await addDoc(collection(db, 'family_members'), {
        associatedUserId: auth.currentUser.uid,
        email: inviteEmail,
        name: inviteEmail.split('@')[0],
        status: 'Pending Sync',
        lastScore: Math.floor(Math.random() * 20) + 70, // Mock data for demo
        timestamp: serverTimestamp()
      });
      setInviteEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'family_members', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-8 pb-20"
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-mono uppercase tracking-widest">{t('Back')}</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--accent-pink-soft)] rounded-xl">
             <Users className="w-6 h-6 text-[var(--accent-pink)]" />
          </div>
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">{t('Family Circle')}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Invite Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="medical-card p-6 border-dashed border-2">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[var(--accent-teal)]" />
              {t('Add Member')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
              {t('Invite a loved one to your circle to monitor their vitality and receive wellness alerts.')}
            </p>
            <form onSubmit={handleInvite} className="space-y-4">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm focus:border-[var(--accent-teal-border)] transition-colors outline-none"
                required
              />
              <button
                type="submit"
                disabled={isInviting}
                className="w-full py-3 bg-[var(--accent-teal)] text-[var(--bg-main)] font-bold rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isInviting ? t('Sending...') : t('Send Pulse Invite')}
              </button>
            </form>
          </div>

          <div className="bg-[var(--accent-teal-soft)]/30 border border-[var(--accent-teal-border)] rounded-2xl p-4 flex gap-4">
             <Shield className="w-5 h-5 text-[var(--accent-teal)] shrink-0" />
             <p className="text-[10px] text-[var(--accent-teal)] leading-relaxed font-mono">
               {t('SECURE_PROTOCOL: Only shared vitality scores and status alerts are visible to circle members. Private biometric images are never shared.')}
             </p>
          </div>
        </div>

        {/* Members List */}
        <div className="md:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {members.length === 0 ? (
              <div className="text-center py-12 border border-[var(--border-color)] rounded-[2rem] opacity-40">
                <Bell className="w-8 h-8 mx-auto mb-3" />
                <p className="font-mono text-xs uppercase tracking-widest">{t('Circle is empty')}</p>
              </div>
            ) : (
              members.map((member) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="medical-card p-6 flex items-center justify-between group hover:border-[var(--accent-pink-border)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--bg-card-hover)] to-[var(--border-color)] flex items-center justify-center border border-[var(--border-color)]">
                        <Heart className={cn("w-5 h-5", member.lastScore && member.lastScore < 75 ? "text-rose-500 animate-pulse" : "text-[var(--accent-pink)]")} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--bg-card)]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)]">{member.name}</h4>
                      <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">{member.status}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                       <span className="text-2xl font-display font-bold text-[var(--text-primary)]">{member.lastScore || '--'}</span>
                       <p className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">{t('Score')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2.5 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-colors">
                          <Share2 className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => removeMember(member.id)}
                        className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
