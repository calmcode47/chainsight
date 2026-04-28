import React, { useState, useEffect } from 'react';
import { Database, Zap, RefreshCw, Trash2, ShieldAlert, Lock, Unlock, BarChart } from 'lucide-react';
import client from '../api/client';

const Demo: React.FC = () => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2026') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect PIN');
      setPin('');
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await client.get('/demo/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleAction = async (endpoint: string, method: 'get' | 'post' | 'delete', actionName: string) => {
    try {
      setLoading(actionName);
      if (method === 'get') await client.get(endpoint);
      if (method === 'post') await client.post(endpoint);
      if (method === 'delete') await client.delete(endpoint);
      
      alert(`${actionName} Successful`);
      fetchStats();
    } catch (err) {
      alert(`${actionName} Failed`);
    } finally {
      setLoading(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="glass-card p-8 border border-white/10 max-w-sm w-full">
          <div className="bg-rose-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Lock className="text-rose-500" size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2">Restricted Access</h2>
          <p className="text-gray-500 text-sm mb-8">This control panel is for demonstration purposes only.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Demo PIN" 
              className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-bold tracking-[0.5em] focus:border-blue-500 outline-none transition-all"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
              <Unlock size={18} />
              Unlock Controls
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            Demo Orchestrator
            <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Admin</span>
          </h1>
          <p className="text-gray-500 text-sm">Control the live demo environment state and real-time triggers.</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-gray-500 hover:text-white transition-colors">
          <Lock size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats && Object.entries(stats).map(([key, val]) => (
          <div key={key} className="glass-card p-4 border border-white/5">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{key}</div>
            <div className="text-xl font-black">{val as number}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Actions */}
        <div className="glass-card p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="text-blue-500" size={24} />
            <h3 className="text-lg font-bold">Database Lifecycle</h3>
          </div>
          
          <button 
            onClick={() => handleAction('/api/seed?force=true', 'get', 'Database Reset')}
            disabled={loading !== null}
            className="w-full group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-2 rounded-lg group-hover:rotate-180 transition-transform duration-500">
                <RefreshCw size={20} className="text-blue-500" />
              </div>
              <div className="text-left">
                <div className="font-bold">Full Reset & Seed</div>
                <div className="text-[10px] text-gray-500">Wipe and re-populate with 50 fresh shipments</div>
              </div>
            </div>
            {loading === 'Database Reset' ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} className="text-gray-600" />}
          </button>

          <button 
            onClick={() => handleAction('/api/demo/clear-logs', 'delete', 'Log Wipe')}
            disabled={loading !== null}
            className="w-full group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-rose-500/20 p-2 rounded-lg">
                <Trash2 size={20} className="text-rose-500" />
              </div>
              <div className="text-left">
                <div className="font-bold">Clear AI logs</div>
                <div className="text-[10px] text-gray-500">Delete all history from ai_analysis_logs</div>
              </div>
            </div>
            {loading === 'Log Wipe' ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} className="text-gray-600" />}
          </button>
        </div>

        {/* Realtime Triggers */}
        <div className="glass-card p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-amber-500" size={24} />
            <h3 className="text-lg font-bold">Live Interventions</h3>
          </div>

          <button 
            onClick={() => handleAction('/api/demo/trigger-alert', 'post', 'Alert Trigger')}
            disabled={loading !== null}
            className="w-full group flex items-center justify-between p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <ShieldAlert size={20} className="text-amber-500" />
              </div>
              <div className="text-left">
                <div className="font-bold text-amber-500">Trigger Critical Alert</div>
                <div className="text-[10px] text-amber-700">Immediate Realtime Disruption on Dashboard</div>
              </div>
            </div>
            {loading === 'Alert Trigger' ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} className="text-amber-600" />}
          </button>

          <button 
            onClick={() => handleAction('/api/demo/simulate-optimization', 'post', 'Optimization Sim')}
            disabled={loading !== null}
            className="w-full group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <BarChart size={20} className="text-emerald-500" />
              </div>
              <div className="text-left">
                <div className="font-bold">Simulate Multi-Optimization</div>
                <div className="text-[10px] text-gray-500">Delay 3 shipments then run AI Route Optimizer</div>
              </div>
            </div>
            {loading === 'Optimization Sim' ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} className="text-gray-600" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Demo;
