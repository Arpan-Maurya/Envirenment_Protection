import React from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { useAppStore } from '../store';
import { Card, } from '../components/ui/card';
import { LogOut, User, Shield, Bell, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ProfileEditModal } from '../components/profile/ProfileModals';
import { PrivacySecurityModal, NotificationsModal } from '../components/settings/SettingsModals';

export const Settings: React.FC = () => {
  const { logout } = useAuth();
  const user = useAppStore(s => s.user);

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight italic">App <span className="text-primary not-italic">Settings</span></h1>
        <p className="text-neutral-500 font-medium">Manage your account and preferences</p>
      </header>

      <div className="space-y-6">
        <section>
          <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Account</h2>
          <Card className="rounded-[2rem] border-neutral-100 shadow-sm overflow-hidden">
             <div className="divide-y divide-neutral-100">
               <ProfileEditModal trigger={
                 <div className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer group w-full">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                         <User size={20} />
                      </div>
                      <div className="text-left">
                         <p className="text-sm font-bold text-neutral-900">Profile Information</p>
                         <p className="text-xs text-neutral-400">{user.name}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-neutral-300 group-hover:text-primary transition-colors" />
                 </div>
               } />
               
               <PrivacySecurityModal trigger={
                 <div className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer group w-full">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                         <Shield size={20} />
                      </div>
                      <div className="text-left">
                         <p className="text-sm font-bold text-neutral-900">Privacy & Security</p>
                         <p className="text-xs text-neutral-400">Manage data & passwords</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-neutral-300 group-hover:text-primary transition-colors" />
                 </div>
               } />
             </div>
          </Card>
        </section>

        <section>
          <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Preferences</h2>
          <Card className="rounded-[2rem] border-neutral-100 shadow-sm overflow-hidden">
             <div className="divide-y divide-neutral-100">
               <NotificationsModal trigger={
                 <div className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer group w-full">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                         <Bell size={20} />
                      </div>
                      <div className="text-left">
                         <p className="text-sm font-bold text-neutral-900">Notifications</p>
                         <p className="text-xs text-neutral-400">Email & push preferences</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-neutral-300 group-hover:text-primary transition-colors" />
                 </div>
               } />
             </div>
          </Card>
        </section>

        <section className="pt-4 space-y-3">
          <Button 
            onClick={logout}
            variant="outline" 
            className="w-full rounded-2xl h-12 border-neutral-200 text-neutral-600 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center space-x-2"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </Button>
        </section>

        <p className="text-center text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] pt-8">
          CarbonIQ v1.0.0-hackathon <br/> 
          Crafted for a Greener Future
        </p>
      </div>
    </div>
  );
};
