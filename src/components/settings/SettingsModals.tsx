import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';

export function PrivacySecurityModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Privacy & Security</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
           <div>
             <h4 className="font-bold text-sm mb-1 text-neutral-900">Data Usage</h4>
             <p className="text-sm text-neutral-600">Your carbon footprint data and profile information are used solely for calculating reductions, generating insights, and improving your app experience. We do not sell your personal data.</p>
           </div>
           <div>
             <h4 className="font-bold text-sm mb-1 text-neutral-900">Privacy Policy</h4>
             <p className="text-sm text-neutral-600">We adhere to global privacy standards ensuring your data is encrypted at rest and in transit via Firebase.</p>
           </div>
           <div>
             <h4 className="font-bold text-sm mb-1 text-neutral-900">Terms of Service</h4>
             <p className="text-sm text-neutral-600">By using CarbonIQ, you agree to track your habits accurately. Exploit of XP or Leaderboards will result in account suspension.</p>
           </div>
           <div>
             <h4 className="font-bold text-sm mb-1 text-neutral-900">Account Security</h4>
             <p className="text-sm text-neutral-600">Your session is authenticated via Google Firebase Auth. We recommend updating your password regularly and avoiding sharing devices.</p>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NotificationsModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({ push: true, missions: true, weekly: false, goals: true });

  const toggle = (key: keyof typeof settings) => setSettings(s => ({...s, [key]: !s[key]}));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Notifications Preferences</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
           {Object.entries({
              push: "Push Notifications",
              missions: "Mission Reminders",
              weekly: "Weekly Reports",
              goals: "Goal Alerts"
           }).map(([key, label]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl">
                 <span className="font-semibold text-sm text-neutral-800">{label}</span>
                 <div 
                   onClick={() => toggle(key as keyof typeof settings)}
                   className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings[key as keyof typeof settings] ? 'bg-primary' : 'bg-neutral-300'}`}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings[key as keyof typeof settings] ? 'translate-x-4' : ''}`}></div>
                 </div>
              </div>
           ))}
           <Button className="w-full mt-4" onClick={() => setOpen(false)}>Save Preferences</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


