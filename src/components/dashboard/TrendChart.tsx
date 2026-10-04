import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronRight } from "lucide-react";
import { CarbonData, ActionItem, Mission, Habit, Activity } from "../../types";

interface TrendChartProps {
  carbonData: CarbonData;
  actions: ActionItem[];
  missions: Mission[] | null;
  habits: Habit[] | null;
  activities: Activity[] | null;
}

export const TrendChart: React.FC<TrendChartProps> = React.memo(({ carbonData, actions, missions, habits, activities }) => {
  const [trendTimeframe, setTrendTimeframe] = useState<'Day' | 'Week' | 'Month' | '6 Months' | 'Year'>('6 Months');
  const [trendFilterOpen, setTrendFilterOpen] = useState(false);

  const trendData = useMemo(() => {
    const baseMonthly = carbonData.total || 210;
    const history = carbonData.history || [];

    const completedActions = actions.filter(a => a.completed);
    const completedMissions = missions ? missions.filter(m => m.completed) : [];
    const completedHabits = habits ? habits.filter(h => h.completed) : [];

    const actionSavingsMonthly = completedActions.reduce((sum, a) => sum + (a.carbonReduction || 0), 0);
    const missionSavingsMonthly = completedMissions.length * 10;
    const habitSavingsMonthly = completedHabits.length * 5;

    const totalMonthlySavings = actionSavingsMonthly + missionSavingsMonthly + habitSavingsMonthly;

    if (trendTimeframe === 'Day') {
      const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
      const dailyBase = baseMonthly / 30;
      const todayStr = new Date().toDateString();
      const todayActivities = activities ? activities.filter(act => {
        return act.timestamp && new Date(act.timestamp).toDateString() === todayStr;
      }) : [];

      return hours.map((hour) => {
        const hrValue = parseInt(hour.split(':')[0]);
        let todaySavings = 0;
        todayActivities.forEach(act => {
          if (act.timestamp) {
            const actHour = new Date(act.timestamp).getHours();
            if (actHour <= hrValue) {
              if (act.type === 'action') todaySavings += 0.5;
              if (act.type === 'mission') todaySavings += 1.0;
              if (act.type === 'habit') todaySavings += 0.25;
            }
          }
        });

        const baseDailySaving = habitSavingsMonthly / 30;
        const finalValue = Math.max(1, dailyBase - baseDailySaving - todaySavings);
        return {
          name: hour,
          value: Math.round(finalValue * 10) / 10
        };
      });

    } else if (trendTimeframe === 'Week') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dailyBase = baseMonthly / 30;
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      startOfWeek.setHours(0, 0, 0, 0);

      return days.map((day, idx) => {
        let daySavings = 0;
        if (activities) {
          activities.forEach(act => {
            if (act.timestamp) {
              const actDate = new Date(act.timestamp);
              const dayIdx = (actDate.getDay() + 6) % 7; // Mon is 0, Sun is 6
              if (actDate >= startOfWeek && dayIdx <= idx) {
                if (act.type === 'action') daySavings += 0.8;
                if (act.type === 'mission') daySavings += 1.5;
                if (act.type === 'habit') daySavings += 0.4;
              }
            }
          });
        }

        const dayHabitSavings = habitSavingsMonthly / 30;
        const finalValue = Math.max(2, dailyBase - dayHabitSavings - daySavings);
        return {
          name: day,
          value: Math.round(finalValue * 10) / 10
        };
      });

    } else if (trendTimeframe === 'Month') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const weeklyBase = baseMonthly / 4.28;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return weeks.map((week, idx) => {
        let weekSavings = 0;
        if (activities) {
          activities.forEach(act => {
            if (act.timestamp) {
              const actDate = new Date(act.timestamp);
              if (actDate >= startOfMonth) {
                const weekOfAct = Math.floor((actDate.getDate() - 1) / 7);
                if (weekOfAct <= idx) {
                  if (act.type === 'action') weekSavings += 3;
                  if (act.type === 'mission') weekSavings += 6;
                  if (act.type === 'habit') weekSavings += 1.5;
                }
              }
            }
          });
        }

        const weeklyHabitSavings = habitSavingsMonthly / 4.28;
        const finalValue = Math.max(5, weeklyBase - weeklyHabitSavings - weekSavings);
        return {
          name: week,
          value: Math.round(finalValue)
        };
      });

    } else if (trendTimeframe === '6 Months') {
      if (history.length > 0) {
        return history.map((h, idx) => {
          const progressFactor = idx / (history.length - 1 || 1);
          const realSavings = totalMonthlySavings * progressFactor;
          const finalValue = Math.max(50, h.value - realSavings);
          return {
            name: h.month,
            value: Math.round(finalValue)
          };
        });
      } else {
        return [
          { name: 'Current', value: Math.round(baseMonthly) },
        ];
      }

    } else if (trendTimeframe === 'Year') {
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map((month, idx) => {
        const baseYearlyMonth = 340 - (idx * 11);
        const progressFactor = idx / (months.length - 1 || 1);
        const realSavings = totalMonthlySavings * progressFactor;
        const finalValue = Math.max(50, baseYearlyMonth - realSavings);
        return {
          name: month,
          value: Math.round(finalValue)
        };
      });
    }

    return [];
  }, [carbonData.total, carbonData.history, actions, missions, habits, activities, trendTimeframe]);
  
  const trendValues = trendData.map(d => d.value);
  const minVal = trendValues.length > 0 ? Math.min(...trendValues) : 0;
  const maxVal = trendValues.length > 0 ? Math.max(...trendValues) : 100;
  const yDomain = [
    Math.max(0, Math.floor(minVal - (maxVal - minVal) * 0.1)),
    Math.ceil(maxVal + (maxVal - minVal) * 0.1 || 10)
  ];

  return (
    <Card className="rounded-2xl shadow-sm border-neutral-100 font-sans">
      <CardContent className="p-6 font-sans">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-neutral-900 text-sm md:text-base">Footprint Trend</h3>
            
            <div className="relative">
              <button 
                onClick={() => setTrendFilterOpen(!trendFilterOpen)}
                className="px-3 py-1.5 bg-neutral-100 rounded-lg text-xs font-bold text-neutral-600 cursor-pointer hover:bg-neutral-200 transition-all flex items-center space-x-1 border border-transparent hover:border-neutral-200"
              >
                <span>{trendTimeframe === '6 Months' ? '6 Months' : trendTimeframe}</span>
                <ChevronRight size={12} className="transform rotate-90 inline ml-0.5" />
              </button>
              
              {trendFilterOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-neutral-200 shadow-xl rounded-xl py-1 z-30 w-32 flex flex-col text-left">
                  {(['Day', 'Week', 'Month', '6 Months', 'Year'] as const).map(tf => (
                    <button
                      key={tf}
                      onClick={() => {
                        setTrendTimeframe(tf);
                        setTrendFilterOpen(false);
                      }}
                      className={`px-4 py-2 text-xs font-bold text-left transition-colors ${trendTimeframe === tf ? 'bg-green-50 text-emerald-600' : 'text-neutral-600 hover:bg-neutral-50'}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              )}
            </div>
        </div>
        
        <div 
          role="img"
          aria-label={`Carbon footprint trend chart showing data over ${trendTimeframe}`}
          className="h-[180px] w-full mb-4"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dx={-10} domain={yDomain} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#22c55e' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-green-50 rounded-xl p-3 flex space-x-2 items-center text-sm">
          <div className="text-green-600 font-bold">✓ Great job! 🎉</div>
          <div className="text-green-800">Your efforts reduced {Math.max(0, (carbonData.history?.[0]?.value || 0) - carbonData.total)} kg CO₂e since you started.</div>
        </div>
      </CardContent>
    </Card>
  );
});
