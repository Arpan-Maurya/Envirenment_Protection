import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Bell, Check, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';

export const NotificationsPopover: React.FC = React.memo(() => {
  const notifications = useAppStore(s => s.notifications);
  const markNotificationRead = useAppStore(s => s.markNotificationRead);
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="w-10 h-10 rounded-full border-2 border-neutral-100 flex items-center justify-center relative cursor-pointer hover:bg-neutral-50 shadow-sm bg-white transition-all"
      >
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
        <Bell size={20} className={unreadCount > 0 ? "text-neutral-900" : "text-neutral-400"} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-[1.5rem] shadow-2xl shadow-neutral-900/10 border border-neutral-100 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-neutral-50 flex items-center justify-between">
                <h3 className="font-black text-neutral-900 text-sm tracking-tight uppercase italic">Notifications</h3>
                <span className="text-[10px] font-bold text-primary bg-green-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-xs font-medium text-neutral-400">All caught up! 🎉</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-50">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-4 transition-colors hover:bg-neutral-50 relative ${!notif.read ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-neutral-900 text-xs">{notif.title}</h4>
                          <span className="text-[8px] font-bold text-neutral-300 flex items-center uppercase">
                            <Clock size={8} className="mr-0.5" />
                            {new Date(notif.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-medium leading-relaxed mb-3">
                          {notif.message}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                           {!notif.read && (
                             <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-full"
                              onClick={() => markNotificationRead(notif.id)}
                             >
                               <Check size={10} className="mr-1" /> Mark as read
                             </Button>
                           )}
                           {notif.link && (
                             <a 
                              href={notif.link}
                              className="text-[10px] font-bold text-neutral-400 hover:text-neutral-900 flex items-center"
                             >
                               View <ExternalLink size={10} className="ml-0.5" />
                             </a>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-neutral-50 text-center">
                 <button className="text-[10px] font-black text-neutral-400 uppercase tracking-widest hover:text-primary transition-colors">
                    View full alerts history
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});
