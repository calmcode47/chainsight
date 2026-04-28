import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  Route, 
  MessageSquare, 
  Link as LinkIcon,
  Bell,
  RefreshCcw,
  BarChart2,
  Lock
} from 'lucide-react';
import useRealtimeShipments from '../hooks/useRealtimeShipments';
import RealtimeNotification from './RealtimeNotification';
import { supabase } from '../lib/supabase';

const Layout: React.FC = () => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const { connectionStatus, disruptions, retry } = useRealtimeShipments();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Shipments', path: '/shipments', icon: <Package size={20} /> },
    { name: 'Disruptions', path: '/disruptions', icon: <AlertTriangle size={20} /> },
    { name: 'Optimizer', path: '/optimizer', icon: <Route size={20} /> },
    { name: 'AI Assistant', path: '/assistant', icon: <MessageSquare size={20} /> },
    { name: 'System Access', path: '/account', icon: <Lock size={20} /> },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => i.path === location.pathname);
    return item ? item.name : 'ChainSight';
  };

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'bg-green-500', text: 'LIVE', pulse: true };
      case 'connecting':
        return { color: 'bg-amber-500', text: 'CONNECTING', pulse: true };
      case 'disconnected':
        return { color: 'bg-rose-500', text: 'OFFLINE', pulse: false };
      default:
        return { color: 'bg-gray-500', text: 'UNKNOWN', pulse: false };
    }
  };

  const status = getStatusConfig();

  return (
    <div className="flex h-screen bg-[#0A0F1E] text-white overflow-hidden font-inter relative">
      {/* Real-time Notifications */}
      <RealtimeNotification />

      {/* Top Animated Border */}
      <div className="absolute top-0 left-0 right-0 h-[3px] animate-top-border z-[100]" />

      {/* Sidebar */}
      <aside className="w-[240px] bg-[#111827] border-r border-white/10 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <LinkIcon className="text-[#3B82F6]" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ChainSight</span>
        </div>

        <nav className="flex-1 mt-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`
                  flex items-center gap-3 px-6 py-4 transition-all duration-200 border-l-4
                  ${isActive 
                    ? 'border-[#3B82F6] text-[#3B82F6] bg-blue-500/5' 
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Network Status</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? 'animate-pulse-dot' : ''}`} />
                <span className={`text-[10px] font-bold ${status.color.replace('bg-', 'text-')} uppercase tracking-tighter`}>
                  {status.text}
                </span>
              </div>
              {connectionStatus === 'disconnected' && (
                <button onClick={retry} className="text-gray-500 hover:text-white transition-colors">
                  <RefreshCcw size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-[10px] text-gray-500 text-center font-medium italic opacity-50">
            Powered by Gemini 1.5 Flash
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-white/10 bg-[#111827]/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <h1 className="text-lg font-bold tracking-tight">{getPageTitle()}</h1>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded border border-white/10">
              <div className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? 'animate-pulse-dot' : ''}`} />
              <span>{status.text}</span>
              <span className="mx-2 border-l border-white/20 h-3" />
              <span>{currentTime.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <div 
                className={`relative cursor-pointer transition-colors ${showNotifications ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={18} />
                {disruptions.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#111827] animate-bounce">
                    {disruptions.length}
                  </span>
                )}
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute top-10 right-0 w-80 bg-[#111827] border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Alerts</h4>
                      <span className="text-[9px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold">{disruptions.length} NEW</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {disruptions.length === 0 ? (
                        <div className="p-8 text-center text-[10px] text-gray-500 italic">No active disruptions detected.</div>
                      ) : (
                        disruptions.slice(0, 5).map((d) => (
                          <div key={d.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                            <div className="flex gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${d.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-white leading-tight uppercase tracking-tighter">{d.type.replace('_', ' ')}</p>
                                <p className="text-[10px] text-gray-500 line-clamp-2 leading-snug">{d.description}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <Link 
                      to="/disruptions" 
                      onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}
                      className="block p-3 text-center text-[10px] font-black text-blue-500 hover:bg-blue-500/5 transition-colors border-t border-white/5 uppercase tracking-widest"
                    >
                      Enter Alerts Center →
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold">Admin Ops</div>
                  <div className="text-[9px] text-gray-500 uppercase font-bold">Supervisor</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center font-bold text-xs text-[#3B82F6]">
                  AD
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0A0F1E]">
          <div className="max-w-[1600px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
