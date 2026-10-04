import { useAppStore } from "../store";
import { Card, CardContent } from "../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronLeft, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { COLORS, CATEGORY_ICONS } from "../lib/constants";

const CATEGORY_RECOMMENDATIONS: Record<string, string[]> = {
  "Transport": ["Switch to public transit", "Carpool to work", "Consider an EV for your next car"],
  "Home Energy": ["Install LED bulbs", "Reduce AC usage", "Unplug idle electronics"],
  "Food": ["Eat more plant-based meals", "Reduce food waste", "Buy locally sourced groceries"],
  "Shopping": ["Buy second-hand items", "Avoid fast fashion", "Bring reusable bags"],
  "Waste": ["Start composting", "Recycle paper and plastics", "Avoid single-use plastics"]
};

export function DetailedAnalysis() {
  const carbonData = useAppStore(s => s.carbonData);
  const navigate = useNavigate();

  const totalFootprint = carbonData.total;
  const categories = Object.entries(carbonData.breakdown).map(([name, value], index) => {
    return {
      name,
      value,
      percentage: totalFootprint > 0 ? Math.round((value / totalFootprint) * 100) : 0,
      color: COLORS[index % COLORS.length]
    };
  }).filter(c => c.value > 0);

  // Generate mock historical trend based on total history
  const generateTrend = (catValue: number) => {
     return carbonData.history?.map(h => ({
       month: h.month,
       value: Math.round(h.value * (catValue / totalFootprint))
     })) || [];
  };

  return (
    <div className="max-w-md mx-auto h-full bg-neutral-50/50 lg:max-w-3xl min-h-screen pb-10">
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="p-2 -ml-2 hover:bg-neutral-50 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-neutral-900" />
        </button>
        <h1 className="font-bold text-neutral-900 text-lg">Detailed Analysis</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-6">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.name] || Leaf;
          const trendData = generateTrend(cat.value);

          return (
            <Card key={cat.name} className="border-neutral-100 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                         <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-neutral-900">{cat.name}</h3>
                        <p className="text-sm font-medium text-neutral-500">{cat.percentage}% of your footprint</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <h4 className="font-black text-xl" style={{ color: cat.color }}>{cat.value}</h4>
                      <p className="text-xs font-bold text-neutral-400 uppercase">kg CO₂e</p>
                   </div>
                </div>

                <div className="h-[120px] w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: cat.color, fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="value" stroke={cat.color} strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-neutral-50 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-neutral-700 mb-2">Improvement Suggestions</h4>
                  <ul className="space-y-2">
                    {CATEGORY_RECOMMENDATIONS[cat.name]?.map((rec, i) => (
                       <li key={i} className="flex items-start space-x-2 text-sm text-neutral-600">
                         <span className="text-primary mt-0.5">•</span>
                         <span className="font-medium">{rec}</span>
                       </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
