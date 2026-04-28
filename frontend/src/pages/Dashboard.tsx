import React, { useMemo } from 'react';
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  TrendingDown, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { useShipments } from '../hooks/useShipments';
import { Shipment, DisruptionAlert } from '../types';
import MetricCard from '../components/MetricCard';
import SkeletonCard from '../components/SkeletonCard';
import StatusBadge from '../components/StatusBadge';
import ConfidenceBar from '../components/ConfidenceBar';

const Dashboard: React.FC = () => {
  const { shipments, metrics, disruptions, loading } = useShipments();

  const sortedShipments = useMemo(() => {
    const severityMap = { critical: 0, delayed: 1, at_risk: 2, on_time: 3 };
    return [...shipments].sort((a, b) => severityMap[a.status] - severityMap[b.status]).slice(0, 10);
  }, [shipments]);

  if (loading && !metrics) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="h-[420px] skeleton rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* SECTION 1: KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Shipments" 
          value={metrics?.total_shipments || 0} 
          change="+8.2%" 
          changeType="up"
          icon={<Package size={20} />} 
          color="#3B82F6" 
        />
        <MetricCard 
          title="On Time %" 
          value={`${metrics ? Math.round((metrics.on_time / metrics.total_shipments) * 100) : 0}%`} 
          change="-1.4%" 
          changeType="down"
          icon={<CheckCircle size={20} />} 
          color="#10B981" 
        />
        <MetricCard 
          title="Active Disruptions" 
          value={metrics?.disruptions_detected_today || 0} 
          change="+2" 
          changeType="up"
          icon={<AlertTriangle size={20} />} 
          color="#F59E0B" 
        />
        <MetricCard 
          title="Cost Saved Today" 
          value={`$${((metrics?.cost_saved_usd || 0) / 1000).toFixed(1)}K`} 
          change="+$4.2K" 
          changeType="up"
          icon={<TrendingDown size={20} />} 
          color="#10B981" 
        />
      </div>

      {/* SECTION 2: World Map Visualization */}
      <div className="bg-[#111827] border border-white/10 rounded-lg p-6 relative overflow-hidden glass-card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Global Logistics Network</h3>
          <div className="flex gap-4">
            <LegendItem color="bg-green-500" label="On Time" />
            <LegendItem color="bg-yellow-500" label="At Risk" />
            <LegendItem color="bg-orange-500" label="Delayed" />
            <LegendItem color="bg-red-500" label="Critical" />
          </div>
        </div>
        
        <div className="relative w-full h-[420px] bg-[#0A0F1E]/50 rounded border border-white/5 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-10" pointerEvents="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <svg viewBox="0 0 1000 420" className="w-full h-full relative z-10">
            <g fill="#1F2937" opacity="0.5">
              <path d="M150,100 L300,80 L350,150 L320,250 L200,280 L120,200 Z" />
              <path d="M220,280 L300,320 L280,400 L220,380 Z" />
              <path d="M450,80 L600,60 L650,120 L600,220 L500,200 L450,150 Z" />
              <path d="M480,200 L580,220 L550,320 L480,300 Z" />
              <path d="M750,280 L850,300 L820,380 L750,350 Z" />
            </g>

            {shipments.slice(0, 8).map((shp) => {
              const startX = ((shp.origin.lng + 180) / 360) * 1000;
              const startY = ((90 - shp.origin.lat) / 180) * 420;
              const endX = ((shp.destination.lng + 180) / 360) * 1000;
              const endY = ((90 - shp.destination.lat) / 180) * 420;
              const curX = ((shp.current_location.lng + 180) / 360) * 1000;
              const curY = ((90 - shp.current_location.lat) / 180) * 420;

              return (
                <g key={shp.id}>
                  <path 
                    d={`M ${startX} ${startY} Q ${(startX+endX)/2} ${(startY+endY)/2 - 50} ${endX} ${endY}`}
                    fill="none"
                    stroke={getStatusColor(shp.status)}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="animate-route-flow"
                    opacity="0.3"
                  />
                  <circle 
                    cx={curX} cy={curY} r="4" 
                    fill={getStatusColor(shp.status)}
                    className="animate-pulse-dot"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* SECTION 3: Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Critical Shipment Monitor</h3>
            <button className="text-xs text-[#3B82F6] font-bold hover:underline">Full Fleet View</button>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-lg overflow-hidden glass-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-medium uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedShipments.map((shp) => (
                  <tr key={shp.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 font-mono font-bold text-gray-300">{shp.id}</td>
                    <td className="px-6 py-4 font-medium text-white">{shp.origin.city} → {shp.destination.city}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={shp.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${shp.delay_hours > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {shp.delay_hours > 0 ? `+${shp.delay_hours}h` : '0h'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Recent Alerts</h3>
            <span className="text-[10px] text-gray-600">Syncing...</span>
          </div>
          <div className="space-y-4">
            {disruptions.slice(0, 5).map((alert, idx) => (
              <div 
                key={alert.id} 
                className="bg-[#111827] border border-white/10 rounded-lg p-4 relative overflow-hidden glass-card transition-all hover:border-white/20 animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSeverityBg(alert.severity)}`} />
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-bold text-white capitalize">{alert.type.replace('_', ' ')}</h4>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                    <Clock size={10} />
                    {new Date(alert.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                  {alert.description}
                </p>
                <ConfidenceBar value={alert.ai_confidence} label="AI Confidence" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Activity Footer */}
      <div className="h-10 bg-[#111827] border-y border-white/10 flex items-center overflow-hidden">
        <div className="bg-blue-500 h-full px-4 flex items-center text-[10px] font-bold tracking-widest uppercase z-10 whitespace-nowrap shadow-xl">
          Live Feed
        </div>
        <div className="flex-1 whitespace-nowrap overflow-hidden relative">
          <div className="inline-block animate-ticker pl-[100%] text-xs font-mono text-gray-400 py-2">
            SHP-20481 rerouted via Hamburg | SHP-19920 delay detected: Port congestion | AI optimized 3 routes saving $12.4K | Weather system Alpha cleared near Singapore Port | High efficiency detected in Rotterdam Hub
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes route-flow { to { stroke-dashoffset: -20; } }
        .animate-route-flow { animation: route-flow 2s linear infinite; }
      `}</style>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-[10px] text-gray-400 font-medium">{label}</span>
  </div>
);

const getStatusColor = (status: Shipment['status']) => {
  switch (status) {
    case 'on_time': return '#10B981';
    case 'at_risk': return '#F59E0B';
    case 'delayed': return '#F97316';
    case 'critical': return '#F43F5E';
  }
};

const getSeverityBg = (severity: DisruptionAlert['severity']) => {
  switch (severity) {
    case 'critical': return 'bg-rose-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-emerald-500';
  }
};

export default Dashboard;
