import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentSnapshot, onSnapshot } from 'firebase/firestore';
import { Card, CardContent } from '../components/ui/card';
import { Trophy, Medal, User, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardUser {
  uid: string;
  name: string;
  photoURL?: string;
  level: number;
  ecoPoints: number;
  lifetimeXp: number;
  streak: number;
}

export const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const baseQuery = () => query(
    collection(db, 'leaderboard'),
    orderBy('lifetimeXp', 'desc'),
    limit(10)
  );

  const fetchUsers = async (isFirst = true) => {
    try {
      if (isFirst) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let q = baseQuery();

      if (!isFirst && lastDoc) {
        q = query(
          collection(db, 'leaderboard'),
          orderBy('lifetimeXp', 'desc'),
          startAfter(lastDoc),
          limit(10)
        );
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => doc.data() as LeaderboardUser);
      
      if (isFirst) {
        setUsers(data);
      } else {
        setUsers(prev => [...prev, ...data]);
      }

      setHasMore(snap.docs.length >= 10);

      if (snap.docs.length > 0) {
        setLastDoc(snap.docs[snap.docs.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching leaderboard", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return undefined;
    const q = baseQuery();
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => doc.data() as LeaderboardUser);
      if (data.length > 0) {
        setUsers(data);
        setLastDoc(snap.docs[snap.docs.length - 1]);
      }
      setHasMore(snap.docs.length >= 10);
      setLoading(false);
    }, (error) => {
      console.error("Error in leaderboard listener", error);
      fetchUsers(true);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading leaderboard...</div>;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight italic">Global <span className="text-primary not-italic">Leaderboard</span></h1>
        <p className="text-neutral-500 font-medium">Top sustainability champions this month</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {users.slice(0, 3).map((user, idx) => (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`text-center p-6 border-0 shadow-lg ${idx === 0 ? 'bg-amber-50 scale-105 border-amber-200' : idx === 1 ? 'bg-slate-50' : 'bg-orange-50'}`}>
              <CardContent className="p-0 space-y-4">
                <div className="relative inline-block">
                  {user.photoURL ? (
                    <img src={user.photoURL} className="w-20 h-20 rounded-full border-4 border-white shadow-md mx-auto" alt="" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md mx-auto text-neutral-400">
                      <User size={32} />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    {idx === 0 ? <Trophy className="text-amber-500 fill-amber-500" size={16} /> : <Medal className={idx === 1 ? 'text-slate-400 fill-slate-400' : 'text-orange-400 fill-orange-400'} size={16} />}
                  </div>
                </div>
                <div>
                   <h3 className="font-bold text-neutral-900 truncate">{user.name}</h3>
                   <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Level {user.level}</p>
                   {user.streak > 0 && (
                     <p className="text-[10px] font-bold text-orange-500 flex items-center justify-center gap-0.5">
                       <Flame size={10} className="mr-0.5" />{user.streak} day streak
                     </p>
                   )}
                </div>
                <div className="bg-white/50 rounded-2xl py-2 px-4 inline-block">
                   <span className="text-xl font-black text-neutral-900">{user.lifetimeXp.toLocaleString()}</span>
                   <span className="text-[10px] font-bold text-neutral-400 uppercase ml-1">lifetime XP</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="rounded-[2rem] border-neutral-100 shadow-sm overflow-hidden">
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100 flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-400">
          <span>Rank & User</span>
          <span>Lifetime XP</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {users.map((user, idx) => {
            const isCurrentUser = auth.currentUser && user.uid === auth.currentUser.uid;
            return (
              <div 
                key={user.uid} 
                className={`px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                  isCurrentUser ? 'bg-green-50/50 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`w-6 text-sm font-black ${idx < 3 ? 'text-primary' : 'text-neutral-400'}`}>{idx + 1}</span>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                     {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <User className="p-2 text-neutral-400" />}
                  </div>
                  <div>
                     <div className="flex items-center gap-1.5 animate-fade-in">
                       <p className="font-bold text-neutral-900 text-sm truncate max-w-[150px]">{user.name}</p>
                       {isCurrentUser && (
                         <span className="bg-primary text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full inline-block">You</span>
                       )}
                     </div>
                     <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Level {user.level}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                     <p className="font-black text-neutral-900">{user.lifetimeXp.toLocaleString()}</p>
                     {user.streak > 0 && (
                       <div className="flex items-center text-[10px] text-orange-500 font-bold justify-end">
                          <Flame size={10} className="mr-0.5" />
                          <span>🔥 {user.streak} days</span>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            );
          })}
          {users.length === 0 && <div className="p-8 text-center text-neutral-400">No entries yet. Be the first!</div>}
        </div>
      </Card>

      {hasMore && users.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => fetchUsers(false)}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-250 text-neutral-800 hover:text-neutral-900 font-bold text-sm transition-all shadow-sm border border-neutral-200/50 disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load More Champions'}
          </button>
        </div>
      )}
    </div>
  );
};
