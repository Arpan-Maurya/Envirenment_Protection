import React from 'react';
import { Card, CardContent } from "../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronRight, Leaf } from "lucide-react";
import { COLORS, CATEGORY_ICONS } from "../../lib/constants";
import { CarbonData } from "../../types";
import { useNavigate } from "react-router-dom";

interface FootprintPieProps {
  carbonData: CarbonData;
}

export const FootprintPie: React.FC<FootprintPieProps> = React.memo(({ carbonData }) => {
  const navigate = useNavigate();
  const pieData = Object.entries(carbonData.breakdown)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0);

  return (
    <Card className="rounded-2xl shadow-sm border-neutral-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-neutral-900">Footprint Breakdown</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div
            role="img"
            aria-label={`Carbon footprint breakdown: ${pieData.map(d => `${d.name} ${d.value} kg`).join(', ')}`}
            className="relative w-[160px] h-[160px] flex-shrink-0"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={"cell-" + index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-neutral-900">{carbonData.total}</span>
              <span className="text-[10px] bg-clip-text text-neutral-400 font-medium">kg CO<sub className="font-normal text-[8px]">2</sub>e</span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-3">
            {pieData.map((item, idx) => {
              const Icon = CATEGORY_ICONS[item.name as keyof typeof CATEGORY_ICONS] || Leaf;
              const percentage = Math.round((item.value / carbonData.total) * 100);
              return (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                      <Icon size={14} />
                    </div>
                    <span className="font-semibold text-neutral-700">{item.name}</span>
                  </div>
                  <div className="flex space-x-6 text-neutral-900">
                    <span className="font-bold w-8 text-right">{percentage}%</span>
                    <span className="text-neutral-500 w-12 text-right">{item.value} kg</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 text-center border-t border-neutral-100 pt-4">
          <button 
            onClick={() => navigate('/footprint')}
            className="text-sm font-semibold text-neutral-600 hover:text-primary transition-colors flex items-center justify-center mx-auto space-x-1"
          >
            <span>View detailed analysis</span> <ChevronRight size={16} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
});
