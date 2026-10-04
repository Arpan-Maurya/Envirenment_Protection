import { useState } from "react";
import { useAppStore } from "../store";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronLeft, ChevronDown, Leaf, } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

import { COLORS, CATEGORY_ICONS } from "../lib/constants";

type TimeFrame = 'Day' | 'Week' | 'Month' | 'Year';

export function FootprintBreakdown() {
  const carbonData = useAppStore(s => s.carbonData);
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<TimeFrame>('Month');
  const [filterOpen, setFilterOpen] = useState(false);

  // Multipliers for different timeframes
  const tmpx: Record<TimeFrame, number> = {
    Day: 1 / 30,
    Week: 1 / 4.28,
    Month: 1,
    Year: 12
  };

  const multiplier = tmpx[timeframe];

  const pieData = Object.entries(carbonData.breakdown)
    .map(([name, value]) => ({ name, value: Math.round(value * multiplier * 10) / 10 }))
    .filter(d => d.value > 0);
    
  const totalScaled = Math.round(carbonData.total * multiplier * 10) / 10;

  return (
    <div className="max-w-md mx-auto h-full bg-white lg:max-w-3xl min-h-screen pb-10">
      {/* Header */}
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="p-2 -ml-2 hover:bg-neutral-50 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-neutral-900" />
        </button>
        <h1 className="font-bold text-neutral-900 text-lg">Footprint Breakdown</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-8">
        {/* Month Selector */}
        <div className="flex justify-end relative">
           <Button 
             variant="outline" 
             size="sm" 
             onClick={() => setFilterOpen(!filterOpen)}
             className="rounded-full bg-neutral-50 border-neutral-200 text-xs font-bold text-neutral-600 h-8"
           >
             This {timeframe} <ChevronDown size={14} className="ml-1" />
           </Button>
           
           {filterOpen && (
             <div className="absolute top-10 right-0 bg-white border shadow-lg rounded-xl flex flex-col overflow-hidden z-20 w-32">
               {(['Day', 'Week', 'Month', 'Year'] as TimeFrame[]).map(tf => (
                  <button 
                    key={tf} 
                    onClick={() => { setTimeframe(tf); setFilterOpen(false); }}
                    className={`text-left px-4 py-2 text-sm font-bold ${timeframe === tf ? 'bg-green-50 text-green-700' : 'text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    {tf}
                  </button>
               ))}
             </div>
           )}
        </div>

        {/* Big Donut Chart */}
        <div className="relative w-full aspect-square max-w-[280px] mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={4}
                cornerRadius={4}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-black text-neutral-900">{totalScaled}</span>
            <span className="text-sm text-neutral-500 font-bold uppercase tracking-widest mt-1">kg CO₂e</span>
          </div>
        </div>

        {/* Detailed Breakdown List */}
        <div className="space-y-4 pt-4">
          {pieData.map((item, idx) => {
            const Icon = CATEGORY_ICONS[item.name] || Leaf;
            const percentage = Math.round((item.value / totalScaled) * 100);
            return (
              <div key={item.name} className="flex items-center justify-between p-1">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" 
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-neutral-400 font-medium">{timeframe}ly consumption</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-neutral-900 text-sm">{percentage}%</div>
                  <div className="text-xs text-neutral-400 font-bold">{item.value} kg</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Analysis Button */}
        <div className="pt-6">
           <Button onClick={() => navigate('/detailed-analysis')} className="w-full h-12 rounded-2xl bg-white border border-neutral-200 text-neutral-700 font-bold shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all flex items-center justify-between px-6">
             <span>View detailed analysis</span>
             <ChevronLeft size={20} className="rotate-180" />
           </Button>
        </div>
      </div>
    </div>
  );
}
