import React from 'react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/ui/card';
import { MapPin, Trophy, Leaf, Zap, Shield, Calendar, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const TYPE_CONFIG: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
  'level': { icon: Trophy, color: 'text-violet-600', bg: 'bg-violet-100' },
  'badge': { icon: Shield, color: 'text-amber-600', bg: 'bg-amber-100' },
  'mission': { icon: Zap, color: 'text-blue-600', bg: 'bg-blue-100' },
  'profile': { icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  'action': { icon: Leaf, color: 'text-primary', bg: 'bg-green-100' },
  'default': { icon: Calendar, color: 'text-slate-600', bg: 'bg-slate-100' }
};

export const ActivityHistory: React.FC = () => {
  const activities = useAppStore(s => s.activities);

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight italic">Your <span className="text-primary not-italic">Timeline</span></h1>
        <p className="text-neutral-500 font-medium">History of your sustainability journey</p>
      </header>

      <div className="relative space-y-4">
        {/* Connection line */}
        <div className="absolute left-6 h-full w-0.5 bg-neutral-100 -z-10" />

        {activities.map((activity, idx) => {
          const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.default;
          const Icon = config.icon;
          const date = new Date(activity.timestamp);

          return (
            <motion.div
              key={activity.id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start space-x-4"
            >
              <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center flex-shrink-0 shadow-sm border border-white/50`}>
                <Icon className={config.color} size={20} />
              </div>
              
              <div className="flex-1 pt-1">
                <Card className="rounded-[1.5rem] border-neutral-100 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-neutral-900 text-sm">{activity.title}</h3>
                      <div className="flex items-center text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                        <Clock size={10} className="mr-1" />
                        <span>{date.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                      {activity.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          );
        })}

        {activities.length === 0 && (
          <div className="p-12 text-center text-neutral-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-bold">No activities recorded yet.</p>
            <p className="text-xs">Start by completing onboarding or a mission!</p>
          </div>
        )}
      </div>
    </div>
  );
};
