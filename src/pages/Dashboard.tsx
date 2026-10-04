import { useEffect } from "react";
import { useAppStore } from "../store";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
// Recharts imports extracted to sub-components
import { Leaf, ArrowDownToLine, ChevronRight, Loader2, Download, Check } from "lucide-react";
import { generatePDFReport } from "../lib/report-generator";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotificationsPopover } from "../components/layout/NotificationsPopover";
import { HabitManager } from "../components/dashboard/HabitManager";
import { ActionModal } from "../components/dashboard/ActionModal";
import { FootprintPie } from "../components/dashboard/FootprintPie";
import { TrendChart } from "../components/dashboard/TrendChart";
import { carbonEquivalency } from "../lib/utils";
import { HABIT_MONTHLY_SAVINGS_KG } from "../lib/carbon-engine";

import { CATEGORY_ICONS } from "../lib/constants";

export function Dashboard() {
  const user = useAppStore(s => s.user);
  const carbonData = useAppStore(s => s.carbonData);
  const actions = useAppStore(s => s.actions);
  const updateCarbonData = useAppStore(s => s.updateCarbonData);
  const fetchRecommendations = useAppStore(s => s.fetchRecommendations);
  const fetchMissions = useAppStore(s => s.fetchMissions);
  const isLoading = useAppStore(s => s.isLoading);
  const habits = useAppStore(s => s.habits);
  const toggleHabit = useAppStore(s => s.toggleHabit);
  const activities = useAppStore(s => s.activities);
  const missions = useAppStore(s => s.missions);
  const navigate = useNavigate();


  const hasOnboarded = user.completedOnboarding;
  useEffect(() => {
    if (!hasOnboarded) return;
    const initData = async () => {
      await updateCarbonData();
      await fetchRecommendations();
      await fetchMissions();
    };
    void initData();
  }, [hasOnboarded, updateCarbonData, fetchRecommendations, fetchMissions]);

  const completedHabitCount = habits.filter(h => h.completed).length;
  const todaySavings = Math.max(0, completedHabitCount * HABIT_MONTHLY_SAVINGS_KG);
  const history = carbonData.history || [];
  const prevMonth = history.length >= 2 ? history[history.length - 2].value : (history.length === 1 ? history[0].value : carbonData.total);
  const monthlyDelta = history.length > 0 && prevMonth > 0
    ? Math.max(0, Math.round(((prevMonth - carbonData.total) / prevMonth) * 100))
    : 0;
  const remainingBudget = Math.max(0, (carbonData.budget || 300) - carbonData.spent);



  if (isLoading && carbonData.total === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f3f9f4]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 font-medium tracking-tight">Syncing your footprint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main Dashboard Panel */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight leading-tight italic">Good morning, <br className="lg:hidden"/><span className="text-primary not-italic">{user.name.split(' ')[0]}</span>!</h1>
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Sustainability Overview</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white border-2 border-neutral-100 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm space-x-2">
               <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shadow-inner">
                  <Leaf size={14} fill="currentColor" />
               </div>
               <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">EcoPoints</span>
                  <span className="text-sm font-black text-neutral-900">{(user.ecoPoints || 0).toLocaleString()}</span>
               </div>
            </div>

            <Button 
               variant="outline" 
               size="icon" 
               className="md:hidden rounded-full border-neutral-200 text-neutral-600 font-bold h-9 w-9"
               onClick={() => generatePDFReport(user, carbonData)}
               aria-label="Download report"
            >
              <Download size={14} />
            </Button>
            <Button 
               variant="outline" 
               size="sm" 
               className="hidden md:flex rounded-full border-neutral-200 text-neutral-600 font-bold h-9"
               onClick={() => generatePDFReport(user, carbonData)}
            >
              <Download size={14} className="mr-2" />
              Download Report
            </Button>
            
            <NotificationsPopover />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Main Footprint Card */}
          <Card className="bg-[#0f2e20] overflow-hidden relative text-white border-0 col-span-1 shadow-2xl shadow-green-900/20 rounded-3xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none scale-150">
               <Leaf size={120} fill="currentColor" />
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-green-200/60 font-bold text-[10px] uppercase tracking-widest mb-1">Carbon Tracking</p>
                  <p className="text-white font-bold text-sm">Monthly Footprint</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                  <Leaf size={18} className="text-green-300" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 mb-1">
                <h2 className="text-5xl font-black tracking-tighter">{carbonData.total}</h2>
                <span className="text-sm font-bold text-green-300/80 uppercase tracking-widest">kg CO₂e</span>
              </div>
              <p className="text-[11px] font-semibold text-green-200/80 mb-5 leading-normal">
                {carbonEquivalency(carbonData.total)}
              </p>
              
              <div className="inline-flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/5 shadow-inner mb-10 text-green-300">
                <ArrowDownToLine size={12} />
                <span>{monthlyDelta >= 0 ? `${monthlyDelta}% vs last month` : `Budget left: ${remainingBudget} kg`}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                    <Check size={14} className="text-green-400" />
                 </div>
                 <p className="text-xs font-bold text-green-100/70 uppercase tracking-tight">{todaySavings > 0 ? `${todaySavings} kg saved today` : 'Log habits to save carbon'}</p>
              </div>

              {/* Decorative chart lines */}
              <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10 pointer-events-none">
                 <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-current text-green-400">
                   <path d="M0,100 L0,50 Q25,30 50,60 T100,20 L100,100 Z" />
                 </svg>
              </div>
            </CardContent>
          </Card>

          <Card className={`rounded-2xl shadow-sm border-neutral-100 flex flex-col justify-between ${carbonData.spent > carbonData.budget ? 'bg-red-50 border-red-100' : ''}`}>
            <CardContent className="p-6">
              <p className={`font-medium text-sm mb-4 ${carbonData.spent > carbonData.budget ? 'text-red-600' : 'text-neutral-500'}`}>
                {carbonData.spent > carbonData.budget ? 'Over Budget' : 'Carbon Budget'}
              </p>
              <div className="flex items-baseline space-x-2 mb-4">
                <h2 className={`text-4xl font-bold tracking-tight ${carbonData.spent > carbonData.budget ? 'text-red-700' : 'text-primary'}`}>
                  {carbonData.spent}
                </h2>
                <span className={`text-xl font-medium ${carbonData.spent > carbonData.budget ? 'text-red-400' : 'text-neutral-400'}`}>
                  / {carbonData.budget} kg
                </span>
              </div>
              
              <Progress 
                value={Math.min((carbonData.spent / carbonData.budget) * 100, 100)} 
                className={`h-2 mb-6 bg-neutral-100 ${carbonData.spent > carbonData.budget ? '[&>div]:bg-red-600' : ''}`} 
              />
              
              <div className="flex items-center space-x-3 mt-auto">
                 <div className="flex-1">
                   {carbonData.spent > carbonData.budget ? (
                     <>
                       <p className="text-sm font-semibold text-red-900 leading-tight">You are {carbonData.spent - carbonData.budget} kg CO<sub className="text-[10px]">2</sub>e</p>
                       <p className="text-sm text-red-600">over your monthly limit.</p>
                     </>
                   ) : (
                     <>
                       <p className="text-sm font-semibold text-neutral-900 leading-tight">You have {carbonData.budget - carbonData.spent} kg CO<sub className="text-[10px]">2</sub>e</p>
                       <p className="text-sm text-neutral-500">remaining this month.</p>
                     </>
                   )}
                 </div>
                 <div className="text-4xl translate-y-1">{carbonData.spent > carbonData.budget ? '⚠️' : '🌍'}</div>
              </div>
            </CardContent>
          </Card>

           {/* Eco Level Card */}
           <Card className="rounded-2xl shadow-sm border-neutral-100 flex flex-col justify-between bg-violet-50/50">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div>
                 <p className="text-neutral-500 font-medium text-sm mb-2">Eco Level</p>
                 <h2 className="text-3xl font-bold text-violet-700 tracking-tight mb-1">Level {user.level}</h2>
                 <p className="text-violet-500/80 font-medium text-sm">{user.lifetimeXp >= 1000 ? 'Sustainability Champion' : user.lifetimeXp >= 500 ? 'Eco Guardian' : 'Eco Explorer'}</p>
              </div>

              <div className="relative flex justify-end -mt-4 mb-2">
                 <div className="w-16 h-16 bg-white rounded-full p-1 shadow-sm flex items-center justify-center border-4 border-violet-100 z-10">
                    <div className="w-full h-full bg-primary rounded-full flex items-center justify-center text-white">
                      <Leaf size={24} />
                    </div>
                 </div>
                 <div className="w-4 h-8 bg-violet-300 absolute -bottom-3 right-8 rounded-b-sm -z-10 skew-x-6"></div>
                 <div className="w-4 h-8 bg-violet-300 absolute -bottom-3 right-4 rounded-b-sm -z-10 -skew-x-6"></div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-semibold text-violet-700/70 mb-1.5">
                  <span>{user.xp % 500} XP</span>
                  <span>Lifetime {user.lifetimeXp || 0} XP</span>
                </div>
                <Progress value={((user.xp || 0) % 500 / 500) * 100} className="h-1.5 bg-violet-200 [&>div]:bg-violet-600" />
                <p className="text-[10px] font-bold text-violet-500/70 uppercase tracking-widest mt-2">🔥 {user.streak || 0} day streak</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           {/* Footprint Breakdown */}
           <FootprintPie carbonData={carbonData} />

           {/* Trend Chart */}
           <TrendChart carbonData={carbonData} actions={actions} missions={missions} habits={habits} activities={activities} />
        </div>

        {/* Daily Habit Checklist */}
        <div className="mb-8">
           <div className="flex justify-between items-center mb-4">
             <div>
               <h3 className="text-lg font-bold text-neutral-900">Daily Habits</h3>
               <p className="text-sm text-neutral-500">Quickly log your consistent eco-actions</p>
             </div>
             <div className="flex gap-2">
               {user.streak && user.streak > 0 && (
                 <div className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full flex items-center">
                   🔥 {user.streak} Day Streak
                 </div>
               )}
               <div className="text-xs font-bold text-primary bg-green-50 px-3 py-1 rounded-full flex items-center">
                 {habits.filter(h => h.completed).length} / {habits.length} Done
               </div>
             </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
             {habits.map((habit) => (
               <div 
                 key={habit.id}
                 onClick={() => toggleHabit(habit.id)}
                 className={`group cursor-pointer rounded-2xl p-3 border transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${
                   habit.completed 
                   ? 'bg-primary border-primary text-white shadow-md' 
                   : 'bg-white border-neutral-100 text-neutral-600 hover:border-primary/30 hover:bg-neutral-50'
                 }`}
               >
                 <div className={`text-2xl transition-transform duration-200 group-hover:scale-110 ${habit.completed ? 'filter brightness-125' : ''}`}>
                   {habit.icon}
                 </div>
                 <div className="flex items-center space-x-1.5">
                   {habit.completed && <Check size={12} className="text-white" />}
                   <span className={`text-[11px] font-bold text-center leading-tight ${habit.completed ? 'text-white' : 'text-neutral-700'}`}>
                     {habit.title}
                   </span>
                 </div>
               </div>
             ))}
             <HabitManager />
           </div>
        </div>

        {/* Top Actions */}
        <div className="mb-8">
           <div className="flex justify-between items-center mb-4">
             <div>
               <h3 className="text-lg font-bold text-neutral-900">Top Actions for You</h3>
               <p className="text-sm text-neutral-500">Personalized actions with the highest impact</p>
             </div>
             <button className="px-4 py-1.5 border border-neutral-200 rounded-full text-sm font-semibold hover:bg-neutral-50 transition-colors">
               View All
             </button>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
             {actions.slice(0, 8).map(action => {
                const Icon = CATEGORY_ICONS[action.category] || Leaf;
                const tagColor = action.impact === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
                
                return (
                  <ActionModal key={action.id} action={action} trigger={
                    <Card className="rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                            <Icon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-neutral-900 truncate pr-2">{action.title}</h4>
                            {action.completed ? (
                              <span className="text-[11px] font-bold text-green-600">✓ Completed</span>
                            ) : (
                              <p className="text-[11px] text-neutral-500 font-medium">Save {action.carbonReduction} kg CO₂e / month</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 border-t border-neutral-50 pt-4">
                          <div className="flex space-x-2">
                             <span className={"text-[10px] px-2 py-0.5 rounded-full font-bold " + tagColor}>{action.impact} Impact</span>
                             <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold border border-green-100/50">{action.difficulty}</span>
                          </div>
                          <ChevronRight size={16} className="text-neutral-400" />
                        </div>
                      </CardContent>
                    </Card>
                  } />
                )
             })}
           </div>
        </div>

        {/* Simulator Ad */}
        <div className="mb-0">
          <div className="bg-[#0f2e20] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border-b-4 border-green-700/50 mt-4">
            <svg className="absolute -right-4 -top-4 w-48 h-48 md:w-64 md:h-64 text-green-800 opacity-50" viewBox="0 0 100 100" fill="currentColor">
               <circle cx="50" cy="50" r="50" />
            </svg>
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">What-If Simulator</h4>
              <p className="text-sm text-green-100/80 max-w-[350px] mb-6 leading-relaxed">See the impact of your choices before you make them. Test different scenarios and optimize your footprint.</p>
              <button 
                onClick={() => navigate('/simulator')} 
                className="inline-flex items-center space-x-2 bg-white text-[#0f2e20] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-green-50 transition-colors"
                title="Try Simulator"
              >
                <span>Try Simulator</span>
                <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="absolute right-2 md:right-12 bottom-0 text-7xl md:text-8xl translate-y-2 translate-x-2">
              🌍
            </div>
            <div className="absolute right-20 md:right-32 top-6 text-3xl md:text-4xl">
               ☁️
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
