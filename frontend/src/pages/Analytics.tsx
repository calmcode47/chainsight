import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, BarChart, Bar, Legend, ReferenceLine 
} from 'recharts';
import { TrendingUp, Clock, AlertOctagon, DollarSign, RefreshCw, ChevronRight } from 'lucide-react';
import axios from '../api/client';
import SparklineChart from '../components/SparklineChart';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, summaryRes] = await Promise.all([
        axios.get('/analytics/metrics-history?days=7'),
        axios.get('/analytics/summary')
      ]);
      
      setData(historyRes.data);
      setSummary(summaryRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load historical analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-white/5 rounded-2xl border border-white/10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-white/5 rounded-2xl border border-white/10" />
          <div className="h-80 bg-white/5 rounded-2xl border border-white/10" />
        </div>
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="bg-white/5 p-6 rounded-full mb-4">
          <TrendingUp size={48} className="text-gray-600" />
        </div>
        <h3 className="text-xl font-bold">Inaugurating Analytics...</h3>
        <p className="text-gray-500 max-w-xs mt-2">
          We need at least 48 hours of data snapshots to generate historical trend reports. 
          Check back tomorrow!
        </p>
      </div>
    );
  }

  // Format dates for charts
  const chartData = data.map(s => ({
    ...s,
    date: new Date(s.snapshot_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    on_time_pct: (s.on_time / s.total_shipments * 100).toFixed(1)
  }));

  const kpis = [
    { 
      label: 'On-Time Avg', 
      value: `${summary?.week_on_time_avg}%`, 
      delta: summary?.trend === 'improving' ? '+2.4%' : '-1.2%',
      isPositive: summary?.trend === 'improving',
      icon: <TrendingUp size={16} />,
      color: '#10B981',
      sparkline: chartData.map(s => (s.on_time / s.total_shipments * 100))
    },
    { 
      label: 'Avg Delay', 
      value: `${data[data.length-1].avg_delay_hours}h`, 
      delta: '-15%',
      isPositive: true,
      icon: <Clock size={16} />,
      color: '#F59E0B',
      sparkline: chartData.map(s => s.avg_delay_hours)
    },
    { 
      label: 'Total Risks', 
      value: summary?.total_disruptions, 
      delta: '+4',
      isPositive: false,
      icon: <AlertOctagon size={16} />,
      color: '#EF4444',
      sparkline: chartData.map(s => s.disruptions_detected)
    },
    { 
      label: 'Cost Saved', 
      value: `$${(summary?.total_cost_saved / 1000).toFixed(1)}k`, 
      delta: '+$2.1k',
      isPositive: true,
      icon: <DollarSign size={16} />,
      color: '#3B82F6',
      sparkline: chartData.map(s => s.cost_saved_usd)
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Supply Chain Intelligence Hub
            <span className="text-[10px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">7-Day Analysis</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Deep dive into logistics performance and AI-driven efficiency gains.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-xs font-bold"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Dataset
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass-card p-6 border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/5 p-2 rounded-lg group-hover:scale-110 transition-transform">
                {React.cloneElement(kpi.icon as React.ReactElement, { style: { color: kpi.color } })}
              </div>
              <SparklineChart data={kpi.sparkline} color={kpi.color} />
            </div>
            <div className="text-2xl font-black">{kpi.value}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
              <span className={`text-[10px] font-bold ${kpi.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {kpi.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Trends */}
      <div className="grid grid-cols-1 gap-8">
        {/* Status Area Chart */}
        <div className="glass-card p-8 border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Shipment Status Composition</h3>
              <p className="text-xs text-gray-500">Volume distribution across status categories over the last 7 days.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> ON TIME
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                <div className="w-2 h-2 rounded-full bg-rose-500" /> CRITICAL
              </div>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                />
                <ReferenceLine y={87} label={{ value: "Target (87%)", fill: "#3B82F6", fontSize: 9, fontWeight: 800, position: 'right' }} stroke="#3B82F6" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="on_time" stackId="1" stroke="#10B981" fillOpacity={1} fill="url(#colorOnTime)" />
                <Area type="monotone" dataKey="at_risk" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} />
                <Area type="monotone" dataKey="delayed" stackId="1" stroke="#FB923C" fill="#FB923C" fillOpacity={0.1} />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#EF4444" fillOpacity={1} fill="url(#colorCritical)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delay Line Chart */}
          <div className="glass-card p-8 border border-white/10">
            <h3 className="text-lg font-bold mb-6">Avg Delay Volatility</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="avg_delay_hours" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Efficiency Bar Chart */}
          <div className="glass-card p-8 border border-white/10">
            <h3 className="text-lg font-bold mb-6">AI Proactivity vs Disruptions</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                  <Bar dataKey="routes_optimized" name="Routes Optimized" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="disruptions_detected" name="Disruptions Detected" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cost Savings Area */}
        <div className="glass-card p-8 border border-white/10 bg-gradient-to-br from-blue-600/5 to-transparent">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Cumulative Logistics Savings</h3>
              <p className="text-xs text-gray-500">Total USD saved through AI-powered route optimization.</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-blue-500">${(summary?.total_cost_saved / 1000).toFixed(1)}k</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Saved this week</div>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="cost_saved_usd" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
