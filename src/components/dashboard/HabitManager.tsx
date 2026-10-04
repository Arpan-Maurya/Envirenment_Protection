import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Plus, PlusCircle, Trash2, } from 'lucide-react';

const AVAILABLE_HABITS = [
  { id: 'h1', title: 'Used Reusable Bag', icon: '🛍️' },
  { id: 'h2', title: 'No Food Waste', icon: '🍲' },
  { id: 'h3', title: 'Unplugged Idle Devices', icon: '🔌' },
  { id: 'h4', title: 'Used Public Transport', icon: '🚌' },
  { id: 'h5', title: 'Ate Plant-Based', icon: '🥗' },
  { id: 'h6', title: 'Used Reusable Bottle', icon: '💧' },
  { id: 'h7', title: 'Avoided Food Delivery', icon: '🚫' },
  { id: 'h8', title: 'Turned Off Lights', icon: '💡' },
  { id: 'h9', title: 'Saved Water', icon: '🚿' },
  { id: 'h10', title: 'Carpooled', icon: '🚗' },
  { id: 'h11', title: 'Recycled Waste', icon: '♻️' }
];

export const HabitManager = React.memo(function HabitManager() {
  const habits = useAppStore(s => s.habits);
  const addHabit = useAppStore(s => s.addHabit);
  const removeHabit = useAppStore(s => s.removeHabit);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="flex items-center justify-center w-full h-full min-h-[80px] rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-primary/50 hover:text-primary transition-colors hover:bg-green-50">
          <Plus size={24} />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Manage Daily Habits</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {AVAILABLE_HABITS.map(h => {
             const existingHabit = habits.find(habit => habit.id === h.id);
             return (
                <div key={h.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{h.icon}</div>
                    <div className="font-semibold">{h.title}</div>
                  </div>
                  {existingHabit ? (
                    <Button variant="ghost" size="sm" onClick={() => removeHabit(existingHabit.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => addHabit({ ...h, completed: false })} className="text-primary border-primary/20 hover:bg-green-50">
                      <PlusCircle size={16} className="mr-1.5" /> Add
                    </Button>
                  )}
                </div>
             )
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
});
