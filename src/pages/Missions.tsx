import { useState, useEffect } from "react";
import { useAppStore } from "../store";
import { Card, CardContent } from "../components/ui/card";
import { Train, Zap, Home, Trophy, CheckCircle2, Lock, Share2 } from "lucide-react";
import { Progress } from "../components/ui/progress";

import { Button } from "../components/ui/button";

export function Missions() {
  const missions = useAppStore(s => s.missions);
  const achievements = useAppStore(s => s.achievements);
  const checkAchievements = useAppStore(s => s.checkAchievements);
  const completeMission = useAppStore(s => s.completeMission);
  const [activeTab, setActiveTab] = useState<'active'|'completed'|'badges'>('active');

  useEffect(() => {
    checkAchievements();
  }, []);

  const handleShare = (title: string, detail: string, type: 'badge' | 'mission' | 'streak') => {
    let text = "";
    if (type === 'badge') {
      text = `I just unlocked the "${title}" badge on Carbon Path! ${detail}. Join me in saving the planet!`;
    } else if (type === 'mission') {
      text = `I completed the "${title}" mission on Carbon Path and saved ${detail} of CO2! 🌍`;
    } else if (type === 'streak') {
      text = `I've been consistent for ${detail} days on Carbon Path! 🌿 Keeping my eco-habits alive.`;
    }

    const shareData = {
      title: 'My Eco Progress',
      text,
      url: window.location.origin
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      const tweetText = encodeURIComponent(`${shareData.text} ${shareData.url}`);
      window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    }
  };

  const activeMissions = missions.filter(m => !m.completed);
  const completedMissions = missions.filter(m => m.completed);

  return (
    <div className="max-w-md mx-auto h-full bg-neutral-50/30 lg:max-w-3xl lg:p-8 p-4">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-neutral-900 tracking-tight">My Missions & Badges</h1>
      </div>

      {/* Streak Card */}
      <Card className="border-0 shadow-sm rounded-2xl bg-orange-50 mb-6 overflow-hidden">
        <CardContent className="p-4 flex items-center justify-between">
           <div>
             <h4 className="font-bold text-orange-800 flex items-center">
                Current Streak <span className="ml-1 text-lg">🔥</span>
             </h4>
             <div className="flex items-center space-x-2">
               <p className="text-sm font-bold text-neutral-900 mt-1">{useAppStore(state => state.user.streak) || 0} Days</p>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="h-6 w-6 rounded-full text-orange-400 hover:text-orange-600 hover:bg-orange-100 mt-1"
                 onClick={() => handleShare("", String(useAppStore.getState().user.streak || 0), "streak")}
               >
                 <Share2 size={12} />
               </Button>
             </div>
             <p className="text-xs text-orange-700/80 mt-0.5">Stay consistent and keep the streak going!</p>
           </div>
           <div className="text-5xl opacity-80 animate-pulse">🔥</div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex bg-neutral-100 rounded-full p-1 mb-6">
        <button 
          className={"flex-1 py-2 text-sm font-bold rounded-full transition-all " + (activeTab === 'active' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700')}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button 
          className={"flex-1 py-2 text-sm font-bold rounded-full transition-all " + (activeTab === 'completed' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700')}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button 
          className={"flex-1 py-2 text-sm font-bold rounded-full transition-all " + (activeTab === 'badges' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700')}
          onClick={() => setActiveTab('badges')}
        >
          Badges
        </button>
      </div>

      <div className="space-y-4">
        {/* Missions List */}
        {(activeTab === 'active' || activeTab === 'completed') && (
          <div className="space-y-4">
            {(activeTab === 'active' ? activeMissions : completedMissions).map((miss, _i) => {
              const Icon = miss.category === 'Transport' ? Train : miss.category === 'Home Energy' ? Zap : Home;
              return (
                <Card key={miss.id} className="border-neutral-100 shadow-sm rounded-2xl relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                  <CardContent className="p-4 flex items-center justify-between pl-5">
                     <div className="flex items-center space-x-3 w-full pr-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                           <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-neutral-900 mb-1 leading-tight">{miss.title}</h4>
                          <div className="flex items-center space-x-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                             <span className="text-violet-600">+{miss.xpReward} XP</span>
                             <span>•</span>
                             <span className="text-amber-600">+{miss.ecoPointsReward} EcoPoints</span>
                          </div>
                          <Progress value={(miss.current / miss.target) * 100} className="h-1.5 bg-neutral-100 [&>div]:bg-green-500" />
                        </div>
                     </div>
                     <div className="flex flex-col items-end space-y-2 shrink-0">
                        <div className="text-sm font-bold text-neutral-400">
                           {miss.current} / {miss.target}
                        </div>
                        {!miss.completed ? (
                           <Button 
                             variant="secondary" 
                             size="sm" 
                             disabled={miss.current < miss.target}
                             className="h-7 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 hover:bg-green-100 border border-green-100 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-neutral-100"
                             onClick={() => completeMission(miss.id)}
                           >
                             {miss.current >= miss.target ? 'Complete' : 'In Progress'}
                           </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full text-neutral-400 hover:text-primary hover:bg-primary/5"
                            aria-label={`Share ${miss.title}`}
                            onClick={() => handleShare(miss.title, `${miss.target}kg`, "mission")}
                          >
                            <Share2 size={12} />
                          </Button>
                        )}
                     </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {activeTab === 'active' && activeMissions.length === 0 && (
              <div className="text-center py-10">
                <CheckCircle2 className="mx-auto text-green-500 mb-3" size={40} />
                <p className="text-neutral-500 text-sm font-medium">All caught up! New missions coming soon.</p>
              </div>
            )}
          </div>
        )}

        {/* Badges / Achievements List */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((ach) => (
              <Card 
                key={ach.id} 
                className={`border-neutral-100 shadow-sm rounded-2xl transition-all duration-300 ${ach.unlockedAt ? 'bg-white' : 'bg-neutral-50 opacity-70 grayscale'}`}
              >
                <CardContent className="p-5 flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shrink-0 ${ach.unlockedAt ? 'bg-primary/10 shadow-inner' : 'bg-neutral-200'}`}>
                    {ach.badgeIcon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-neutral-900">{ach.title}</h4>
                      {ach.unlockedAt ? <Trophy size={14} className="text-yellow-500" /> : <Lock size={14} className="text-neutral-400" />}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{ach.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        {ach.unlockedAt ? (
                          <span className="text-primary">Earned: {new Date(ach.unlockedAt).toLocaleDateString()}</span>
                        ) : (
                          <span>
                            {ach.type === 'xp' ? `Reach ${(ach.milestoneXp ?? 0).toLocaleString()} lifetime XP`
                              : ach.type === 'streak' ? `Reach a ${ach.milestoneStreak ?? 0}-day streak`
                              : ach.type === 'mission' ? `Complete ${ach.milestoneMissions ?? 0} missions`
                              : `Reach ${ach.milestoneKg ?? 0}kg saved`}
                          </span>
                        )}
                      </div>
                      {ach.unlockedAt && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full text-neutral-400 hover:text-primary hover:bg-primary/5"
                          onClick={() => handleShare(ach.title, ach.description, "badge")}
                        >
                          <Share2 size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
