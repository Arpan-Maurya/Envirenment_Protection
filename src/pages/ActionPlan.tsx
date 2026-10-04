import { useState } from "react";
import { useAppStore } from "../store";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Train, Lightbulb, Leaf, ChevronRight, Target, TrendingDown, Check } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { Slider } from "../components/ui/slider";
import { HabitManager } from "../components/dashboard/HabitManager";
import { ActionModal } from "../components/dashboard/ActionModal";

export function ActionPlan() {
  const actions = useAppStore(s => s.actions);
  const carbonData = useAppStore(s => s.carbonData);
  const setReductionGoal = useAppStore(s => s.setReductionGoal);
  
  const habits = useAppStore(s => s.habits);
  const toggleHabit = useAppStore(s => s.toggleHabit);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      // Mock logic to load more elements
      setLoadingMore(false);
    }, 1000);
  };

  const targetGoal = carbonData.reductionGoal && !isNaN(Number(carbonData.reductionGoal)) && Number(carbonData.reductionGoal) > 0
    ? Number(carbonData.reductionGoal)
    : 50;

  const completedActions = actions.filter(a => a.completed);
  const currentReduction = completedActions.reduce((sum, a) => sum + a.carbonReduction, 0);
  const progress = targetGoal > 0 ? Math.min(100, (currentReduction / targetGoal) * 100) : 0;

  const getIcon = (category: string) => {
    switch (category) {
      case 'Transport': return Train;
      case 'Home Energy': return Lightbulb; 
      case 'Food': return Leaf;
      default: return Leaf;
    }
  };

  return (
    <div className="max-w-md mx-auto h-full bg-neutral-50/30 lg:max-w-3xl lg:p-8 p-4 space-y-8">
      {/* Reduction Goal Card */}
      <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-neutral-900 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Target size={20} className="mr-2 text-primary" />
            Monthly Reduction Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-4xl font-black">{currentReduction} <span className="text-lg font-medium text-neutral-400">kg</span></p>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Reduced so far</p>
            </div>
             <div className="text-right">
              <p className="text-lg font-bold text-primary">{targetGoal} kg</p>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Target Goal</p>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-3 bg-white/10 [&>div]:bg-primary" />
            <div className="flex justify-between text-[10px] font-bold text-neutral-500">
              <span>PROGRESS</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center mt-2">
              <label className="text-xs font-bold text-neutral-400">ADJUST GOAL</label>
              <span className="text-sm font-black text-white">{targetGoal} kg</span>
            </div>
            <Slider 
              value={[targetGoal]} 
              max={150} 
              step={10} 
              onValueChange={(val) => {
                if (Array.isArray(val)) {
                  if (val.length > 0 && val[0] !== undefined && val[0] !== null) {
                    setReductionGoal(val[0]);
                  }
                } else if (typeof val === 'number') {
                  setReductionGoal(val);
                }
              }}
              className="py-2"
            />
            <p className="text-[10px] text-neutral-500 italic">Setting a challenging but achievable goal keeps you motivated!</p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Habits */}
      <div>
        <div className="mb-4">
          <h1 className="text-xl lg:text-2xl font-bold text-neutral-900">Daily Habits</h1>
          <p className="text-sm text-neutral-500 mt-1">Log your consistent eco-actions</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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

      <div>
        <div className="mb-4">
          <h1 className="text-xl lg:text-2xl font-bold text-neutral-900">Your Action Plan</h1>
          <p className="text-sm text-neutral-500 mt-1">Personalized items to hit your {targetGoal}kg target</p>
        </div>

        <div className="space-y-4">
          {actions.filter(a => window.location.pathname.includes('actions') ? true : !a.completed).map((act, i) => {
            const Icon = getIcon(act.category);
            const iconColor = act.completed 
              ? "text-neutral-400 bg-neutral-100" 
              : i === 0 ? "text-blue-500 bg-blue-50" : i === 1 ? "text-yellow-500 bg-yellow-50" : i === 2 ? "text-cyan-500 bg-cyan-50" : "text-green-500 bg-green-50";

            return (
              <ActionModal key={act.id} action={act} trigger={
                <Card 
                  className={`border-neutral-100 shadow-sm rounded-2xl cursor-pointer hover:shadow transition-all ${act.completed ? 'opacity-70 bg-neutral-50/50' : ''}`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                     <div className="flex items-center space-x-4">
                        <div className={"w-12 h-12 rounded-full flex items-center justify-center transition-colors " + iconColor}>
                           <Icon size={24} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-bold text-sm ${act.completed ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>{act.title}</h4>
                            {act.completed && <div className="bg-green-500 rounded-full p-0.5 text-white"><TrendingDown size={10} /></div>}
                          </div>
                          <p className="text-xs text-neutral-500 font-medium mb-2">Save {act.carbonReduction} kg CO₂e / month</p>
                          
                          <div className="flex space-x-2 border-t border-neutral-50 pt-2 shrink-0">
                             <span className={"text-[10px] px-2 py-0.5 rounded-full font-bold " + (act.impact === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>{act.impact} Impact</span>
                             <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold border border-green-100/50">{act.difficulty}</span>
                          </div>
                        </div>
                     </div>
                     {!act.completed && <ChevronRight size={20} className="text-neutral-400 flex-shrink-0" />}
                  </CardContent>
                </Card>
              } />
            )
          })}
        </div>
      </div>

      <div className="mt-8">
        <button 
           onClick={handleLoadMore}
           disabled={loadingMore}
           className="w-full py-3 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 shadow-sm hover:bg-neutral-50 flex items-center justify-center space-x-2"
        >
          {loadingMore ? (
             <><div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" /><span>Loading...</span></>
          ) : (
             <span>Load More Actions</span>
          )}
        </button>
      </div>
    </div>
  );
}
