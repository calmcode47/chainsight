import React from 'react';
import { Shield, Mail, Calendar, LogOut, Settings, Bell, Lock } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { signOut } from '../lib/auth';

const Account: React.FC = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    localStorage.removeItem('chainsight_guest_access');
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">System Access & Security</h2>
        <p className="text-sm text-gray-500">Manage your administrative credentials and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 text-center glass-card">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/40 mx-auto mb-4">
              <Shield className="text-blue-500" size={32} />
            </div>
            <h3 className="font-bold text-lg text-white">{user?.email?.split('@')[0] || 'Administrator'}</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-6">Operations Supervisor</p>
            
            <button 
              onClick={handleLogout}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> SIGN OUT
            </button>
          </div>

          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 glass-card">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Session Info</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <Calendar size={14} className="text-blue-500" />
                <span className="text-gray-400">Last Login: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Lock size={14} className="text-emerald-500" />
                <span className="text-gray-400">Status: Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden glass-card">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Security Configuration</h4>
            </div>
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Multi-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Add an extra layer of security to your admin account.</p>
                </div>
                <div className="w-10 h-5 bg-emerald-500/20 border border-emerald-500/40 rounded-full relative">
                  <div className="absolute right-1 top-1 bottom-1 w-3 bg-emerald-500 rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between opacity-50">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">IP Whitelisting</p>
                  <p className="text-xs text-gray-500">Restrict access to specific corporate network IPs.</p>
                </div>
                <div className="w-10 h-5 bg-white/5 border border-white/10 rounded-full relative">
                  <div className="absolute left-1 top-1 bottom-1 w-3 bg-gray-500 rounded-full" />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Work Email</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Mail size={12} /> {user?.email}
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-blue-500 hover:underline">CHANGE</button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all group">
              <Settings className="text-gray-500 group-hover:text-white transition-colors" size={20} />
              <span className="text-[10px] font-bold text-gray-400">API SETTINGS</span>
            </button>
            <button className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all group">
              <Bell className="text-gray-500 group-hover:text-white transition-colors" size={20} />
              <span className="text-[10px] font-bold text-gray-400">ALERT PREFS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
