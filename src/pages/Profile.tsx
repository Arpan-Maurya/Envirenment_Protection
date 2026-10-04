import { useAppStore } from "../store";
import { Card } from "../components/ui/card";
import { User, Clock, Settings, HelpCircle, ChevronRight, Leaf, Target, Zap, Trophy, BarChart2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfileEditModal, HelpSupportModal, TreePlantModal } from '../components/profile/ProfileModals';
import { carbonEquivalency } from "../lib/utils";

export function Profile() {
  const user = useAppStore(s => s.user);
  const missions = useAppStore(s => s.missions);
  const actions = useAppStore(s => s.actions);
  const habits = useAppStore(s => s.habits);
  const treesPlanted = useAppStore(s => s.treesPlanted);
  const treesOffsetKg = useAppStore(s => s.treesOffsetKg);
  const navigate = useNavigate();

  // Calculate dynamic stats
  const actionsSaved = actions.filter(a => a.completed).reduce((sum, a) => sum + (a.carbonReduction || 0), 0);
  const habitsSaved = habits.filter(h => h.completed).length * 1.5;
  const missionsSaved = missions?.filter(m => m.completed).length * 5;
  
  // Trees planted offset is added to the total carbon saved.
  const totalSaved = Math.round(actionsSaved + habitsSaved + missionsSaved + (treesOffsetKg || 0));
  
  const energyActionsSaved = actions.filter(a => a.completed && a.category === 'Home Energy').reduce((sum, a) => sum + (a.carbonReduction || 0), 0);
  const daysElectricity = Math.floor(energyActionsSaved / 1.5) || 0;
  const completedMissionsCount = missions?.filter(m => m.completed).length || 0;

  return (
    <div className="max-w-md mx-auto h-full bg-neutral-50/30 lg:max-w-3xl pb-8">
      
      {/* Profile Header (Green Area) */}
      <div className="bg-[#0f8b41] rounded-b-[2rem] pt-12 pb-8 px-6 text-white shadow-md relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/20 p-1">
             <div className="w-full h-full rounded-full overflow-hidden bg-neutral-200">
                <img src={"https://api.dicebear.com/7.x/notionists/svg?seed=" + user.name} alt="Avatar" className="w-full h-full object-cover" />
             </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-green-100 mb-1">{user.lifetimeXp >= 1000 ? 'Sustainability Champion' : 'Eco Explorer'} • Level {user.level}</p>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-32 h-1.5 bg-green-900/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, ((user.lifetimeXp || 0) / 500) * 100)}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-green-100">Lifetime {user.lifetimeXp || 0} XP</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
               <span className="text-amber-300">★</span>
               <span>{(user.ecoPoints || 0).toLocaleString()} EcoPoints</span>
            </div>
            {(user.streak || 0) > 0 && (
              <div className="mt-2 inline-flex items-center space-x-2 text-[10px] font-bold text-orange-100">
                <span>🔥 {user.streak} day streak</span>
                <span>•</span>
                <span>Best: {user.longestStreak || 0} days</span>
                <span>•</span>
                <span>{user.totalActiveDays || 0} active days</span>
              </div>
            )}
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 text-6xl">
             🏅
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 mt-2 space-y-6">
        
        {/* Overview Stats */}
        <div className="space-y-4 mb-2">
          <h3 className="font-bold text-neutral-900">Overview</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
             <Card className="rounded-2xl border-none shadow-sm flex flex-col justify-center bg-white p-4">
               <div className="flex items-center space-x-2 mb-2 text-green-600">
                 <Leaf size={16} /> 
                 <span className="font-semibold text-neutral-500 text-xs">Total Saved</span>
               </div>
               <div className="text-xl font-bold text-green-600 mb-1">{totalSaved} <span className="text-xs text-neutral-500">kg CO₂e</span></div>
               {totalSaved > 0 && (
                 <span className="text-[10px] text-neutral-400 font-medium leading-none">
                   {carbonEquivalency(totalSaved)}
                 </span>
               )}
             </Card>
             
             <Card className="rounded-2xl border-none shadow-sm flex flex-col justify-center bg-white p-4">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center space-x-2 text-green-600">
                   <span className="text-lg leading-none">🌲</span>
                   <span className="font-semibold text-neutral-500 text-xs">Trees Planted</span>
                 </div>
                 <TreePlantModal trigger={
                   <button
                     aria-label="Plant a tree"
                     title="Add trees you planted"
                     className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-sm hover:bg-green-700 hover:scale-110 active:scale-95 transition-all"
                   >
                     <Plus size={14} strokeWidth={3} />
                   </button>
                 } />
               </div>
               <div className="text-xl font-bold text-neutral-900 flex items-baseline justify-between pr-1">
                 {treesPlanted}
                 {treesOffsetKg > 0 && (
                   <span className="text-[10px] font-semibold text-neutral-400 leading-none">≈ {Math.round(treesOffsetKg)} kg CO₂e offset</span>
                 )}
               </div>
             </Card>
             
             <Card className="rounded-2xl border-none shadow-sm flex flex-col justify-center bg-white p-4">
               <div className="flex items-center space-x-2 mb-2 text-yellow-500">
                 <Zap size={16} />
                 <span className="font-semibold text-neutral-500 text-xs">Days of Electricity</span>
               </div>
               <div className="text-xl font-bold text-neutral-900">{daysElectricity} <span className="text-xs font-normal text-neutral-500">Days</span></div>
             </Card>

             <Card className="rounded-2xl border-none shadow-sm flex flex-col justify-center bg-white p-4">
               <div className="flex items-center space-x-2 mb-2 text-blue-500">
                 <Target size={16} />
                 <span className="font-semibold text-neutral-500 text-xs">Missions Completed</span>
               </div>
               <div className="text-xl font-bold text-neutral-900">{completedMissionsCount}</div>
             </Card>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
           {[
             { icon: Leaf, label: "Detailed Footprint", path: "/footprint" },
             { icon: BarChart2, label: "What-If Simulator", path: "/simulator" },
             { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
             { icon: Clock, label: "Activity History", path: "/activities" },
             { icon: Settings, label: "Settings", path: "/settings" }
           ].map((item, i) => (
             <button key={i} onClick={() => navigate(item.path)} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-neutral-100 hover:bg-neutral-50 transition-colors">
               <div className="flex items-center space-x-3">
                 <item.icon size={20} className="text-neutral-500" />
                 <span className="font-semibold text-neutral-800 text-sm">{item.label}</span>
               </div>
               <ChevronRight size={18} className="text-neutral-400" />
             </button>
           ))}
           
           <ProfileEditModal trigger={
             <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-neutral-100 hover:bg-neutral-50 transition-colors">
               <div className="flex items-center space-x-3">
                 <User size={20} className="text-neutral-500" />
                 <span className="font-semibold text-neutral-800 text-sm">My Profile Information</span>
               </div>
               <ChevronRight size={18} className="text-neutral-400" />
             </button>
           } />
           
           <HelpSupportModal trigger={
             <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-neutral-100 hover:bg-neutral-50 transition-colors">
               <div className="flex items-center space-x-3">
                 <HelpCircle size={20} className="text-neutral-500" />
                 <span className="font-semibold text-neutral-800 text-sm">Help & Support</span>
               </div>
               <ChevronRight size={18} className="text-neutral-400" />
             </button>
           } />
        </div>

      </div>
    </div>
  );
}
