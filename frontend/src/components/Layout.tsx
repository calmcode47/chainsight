import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  Route, 
  MessageSquare, 
  Link as LinkIcon,
  Bell,
  X
} from 'lucide-react';
import { getDisruptions } from '../api/client';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [disruptionCount, setDisruptionCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const fetchDisruptions = async () => {
      try {
        const data = await getDisruptions();
        setDisruptionCount(data.length);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDisruptions();
    const alertTimer = setInterval(fetchDisruptions, 15000);
    
    return () => {
      clearInterval(timer);
      clearInterval(alertTimer);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Shipments', path: '/shipments', icon: <Package size={20} /> },
    { name: 'Disruptions', path: '/disruptions', icon: <AlertTriangle size={20} /> },
    { name: 'Optimizer', path: '/optimizer', icon: <Route size={20} /> },
    { name: 'AI Assistant', path: '/assistant', icon: <MessageSquare size={20} /> },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => i.path === location.pathname);
    return item ? item.name : 'ChainSight';
  };

  return (
    <div className="flex h-screen bg-[#0A0F1E] text-white overflow-hidden font-inter relative">
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
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
              <span className="text-xs font-bold text-green-500 uppercase tracking-tighter">Live Systems</span>
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
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
              <span>LIVE</span>
              <span className="mx-2 border-l border-white/20 h-3" />
              <span>{currentTime.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <div className="relative cursor-pointer hover:text-white transition-colors text-gray-400">
                <Bell size={18} />
                {disruptionCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#111827] animate-bounce">
                    {disruptionCount}
                  </span>
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
