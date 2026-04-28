import React, { useState, useEffect, useCallback } from 'react';
import { Bell, AlertTriangle, Route, Info, X } from 'lucide-react';
import { DisruptionAlert } from '../types';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'alert' | 'optimization' | 'info';
  timestamp: Date;
}

const RealtimeNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotif = { ...notif, id, timestamp: new Date() };
    
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      return updated.slice(0, 3); // Keep only last 3
    });

    // Auto-dismiss after 5s
    setTimeout(() => {
      dismissNotification(id);
    }, 5000);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const handleNewAlert = (event: any) => {
      const alert = event.detail as DisruptionAlert;
      addNotification({
        title: `CRITICAL: ${alert.type}`,
        description: alert.description,
        type: 'alert'
      });
    };

    window.addEventListener('new-disruption-alert', handleNewAlert);
    return () => window.removeEventListener('new-disruption-alert', handleNewAlert);
  }, [addNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id}
          className={`
            w-80 glass-card p-4 pointer-events-auto animate-slide-in-right relative overflow-hidden
            ${n.type === 'alert' ? 'border-l-4 border-l-rose-500' : ''}
            ${n.type === 'optimization' ? 'border-l-4 border-l-blue-500' : ''}
            ${n.type === 'info' ? 'border-l-4 border-l-gray-500' : ''}
          `}
        >
          <div className="flex gap-3">
            <div className={`
              p-2 rounded-lg 
              ${n.type === 'alert' ? 'bg-rose-500/20 text-rose-500' : ''}
              ${n.type === 'optimization' ? 'bg-blue-500/20 text-blue-500' : ''}
              ${n.type === 'info' ? 'bg-gray-500/20 text-gray-500' : ''}
            `}>
              {n.type === 'alert' && <AlertTriangle size={18} />}
              {n.type === 'optimization' && <Route size={18} />}
              {n.type === 'info' && <Info size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold truncate pr-4">{n.title}</h4>
              <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {n.description}
              </p>
              <span className="text-[8px] text-gray-500 mt-2 block font-mono">
                {n.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <button 
            onClick={() => dismissNotification(n.id)}
            className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
          
          {/* Progress bar for auto-dismiss */}
          <div className="absolute bottom-0 left-0 h-[2px] bg-white/10 w-full">
            <div className="h-full bg-white/20 animate-notification-progress" />
          </div>
        </div>
      ))}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes notification-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-notification-progress {
          animation: notification-progress 5s linear forwards;
        }
      `}} />
    </div>
  );
};

export default RealtimeNotification;
