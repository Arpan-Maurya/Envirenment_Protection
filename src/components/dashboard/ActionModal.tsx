import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { ActionItem } from '../../types';
import { CheckCircle, Leaf, AlertCircle, Clock, Info } from 'lucide-react';

interface ActionModalProps {
  action: ActionItem;
  trigger: React.ReactNode;
}

export const ActionModal = React.memo(function ActionModal({ action, trigger }: ActionModalProps) {
  const completeAction = useAppStore(s => s.completeAction);
  const [open, setOpen] = useState(false);

  const handleComplete = () => {
    completeAction(action.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-white p-6">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {action.completed ? <CheckCircle className="text-green-500" /> : <Leaf className="text-primary" />}
            {action.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div>
            <h4 className="font-bold text-neutral-900 mb-1 flex items-center gap-1"><Info size={16}/> Description</h4>
            <p className="text-sm text-neutral-600 leading-relaxed">{action.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-green-50 rounded-xl">
                <div className="text-xs font-bold text-green-700 uppercase mb-1">Carbon Reduction</div>
                <div className="font-bold text-lg text-green-900">{action.carbonReduction} kg/mo</div>
             </div>
             {action.annualSavings && (
               <div className="p-3 bg-blue-50 rounded-xl">
                  <div className="text-xs font-bold text-blue-700 uppercase mb-1">Annual Savings</div>
                  <div className="font-bold text-lg text-blue-900">${action.annualSavings}</div>
               </div>
             )}
          </div>
          
          <div className="flex gap-4 border-t border-b py-4">
             <div className="flex-1">
                <div className="text-xs font-bold text-neutral-500 uppercase mb-1 flex items-center gap-1"><AlertCircle size={14}/> Difficulty</div>
                <div className="font-semibold">{action.difficulty}</div>
             </div>
             <div className="flex-1">
                <div className="text-xs font-bold text-neutral-500 uppercase mb-1 flex items-center gap-1"><Clock size={14}/> Time</div>
                <div className="font-semibold">{action.timeRequired} {action.timeRequired === 1 ? 'hour' : 'hours'}</div>
             </div>
             <div className="flex-1">
                <div className="text-xs font-bold text-amber-600 uppercase mb-1 flex items-center gap-1">⭐ XP Reward</div>
                <div className="font-semibold text-amber-600">+{action.xpReward ?? 15} XP</div>
             </div>
          </div>
          
          {!action.completed && (
             <Button className="w-full font-bold h-12" onClick={handleComplete}>
               Mark as Completed
             </Button>
          )}
          {action.completed && (
             <div className="bg-green-100 text-green-800 text-center font-bold py-3 rounded-lg flex items-center justify-center gap-2">
               <CheckCircle size={20} /> Action Completed
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
