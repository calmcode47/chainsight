import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plane, 
  Ship, 
  Truck, 
  Train, 
  ChevronDown, 
  ChevronUp, 
  Route, 
  Clock, 
  Package,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { getShipments } from '../api/client';
import { Shipment } from '../types';

const Shipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      const data = await getShipments();
      setShipments(data);
    } catch (error) {
      console.error("Failed to fetch shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const matchesSearch = s.id.toLowerCase().includes(search.toLowerCase()) ||
                          s.carrier.toLowerCase().includes(search.toLowerCase()) ||
                          s.origin.city.toLowerCase().includes(search.toLowerCase()) ||
                          s.destination.city.toLowerCase().includes(search.toLowerCase());
      
      const matchesMode = modeFilter === 'All' || s.mode.toLowerCase() === modeFilter.toLowerCase();
      const matchesStatus = statusFilter === 'All' || s.status.toLowerCase() === statusFilter.toLowerCase().replace(' ', '_');
      
      return matchesSearch && matchesMode && matchesStatus;
    });
  }, [shipments, search, modeFilter, statusFilter]);

  const paginatedShipments = useMemo(() => {
    const start = (currentPage - 1) * 10;
    return filteredShipments.slice(start, start + 10);
  }, [filteredShipments, currentPage]);

  const totalPages = Math.ceil(filteredShipments.length / 10);

  if (loading) return <div className="p-8 text-gray-500 animate-pulse font-mono uppercase tracking-widest text-xs">Synchronizing with Global Fleet...</div>;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, Carrier, City..."
            className="w-full bg-[#111827] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['All', 'Air', 'Sea', 'Road', 'Rail'].map(mode => (
            <button
              key={mode}
              onClick={() => { setModeFilter(mode); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modeFilter === mode ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-[#111827] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-white/10 gap-8">
        {['All', 'On Time', 'At Risk', 'Delayed', 'Critical'].map(status => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
              statusFilter === status ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {status}
            {statusFilter === status && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-white/10 rounded-lg overflow-hidden glass-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Route</th>
              <th className="px-6 py-4">Carrier</th>
              <th className="px-6 py-4">Cargo</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">ETA</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedShipments.map(shp => (
              <React.Fragment key={shp.id}>
                <tr 
                  onClick={() => setExpandedId(expandedId === shp.id ? null : shp.id)}
                  className={`hover:bg-white/5 transition-colors cursor-pointer group ${expandedId === shp.id ? 'bg-white/5' : ''}`}
                >
                  <td className="px-6 py-4 font-mono font-bold text-blue-400">
                    <div className="flex items-center gap-2">
                      {shp.id}
                      {expandedId === shp.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{shp.origin.city} {getCountryEmoji(shp.origin.country)}</span>
                      <span className="text-gray-600">→</span>
                      <span className="font-bold text-white">{shp.destination.city} {getCountryEmoji(shp.destination.country)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      {getModeIcon(shp.mode)}
                      <span>{shp.carrier}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border ${getCargoTypeStyle(shp.cargo_type || 'electronics')}`}>
                      {shp.cargo_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 min-w-[120px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${getProgressColor(shp.status)}`}
                          style={{ width: `${shp.progress_percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-gray-400">{shp.progress_percent}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={shp.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {getRelativeETA(shp.eta)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(shp.status === 'delayed' || shp.status === 'critical') && (
                      <button className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded text-[10px] font-bold hover:bg-amber-500 hover:text-white transition-all uppercase tracking-tighter flex items-center gap-1 ml-auto">
                        <Route size={12} /> Optimize
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === shp.id && (
                  <tr>
                    <td colSpan={8} className="px-8 py-6 bg-black/20 border-l-4 border-l-blue-500 animate-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Timeline */}
                        <div className="lg:col-span-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                            <MapPin size={12} /> Detailed Transit Timeline
                          </h4>
                          <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                            {shp.route_nodes.map((node, i) => (
                              <div key={i} className="relative">
                                <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 border-black/40 ${
                                  i === 0 ? 'bg-emerald-500' : i === shp.route_nodes.length - 1 ? 'bg-blue-500' : 'bg-gray-700'
                                } shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                                <div className="flex justify-between">
                                  <div>
                                    <div className="text-sm font-bold text-white">{node.city}, {node.country}</div>
                                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{node.lat.toFixed(4)}, {node.lng.toFixed(4)}</div>
                                  </div>
                                  <div className="text-[10px] text-gray-600 font-bold uppercase italic">
                                    {i === 0 ? 'Origin' : i === shp.route_nodes.length - 1 ? 'Destination' : `Waypoint ${i}`}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Cargo Assessment</h4>
                            <div className="bg-white/5 border border-white/5 p-4 rounded-lg space-y-3">
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-400">Total Value</span>
                                <span className="text-xs font-bold text-white">
                                  {shp.value_usd ? `$${shp.value_usd.toLocaleString()}` : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-400">Payload Weight</span>
                                <span className="text-xs font-bold text-white">
                                  {shp.weight_kg ? `${shp.weight_kg.toLocaleString()} KG` : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {shp.disruption_type && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg">
                              <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-1">
                                <AlertTriangle size={12} /> Active Disruption
                              </h4>
                              <p className="text-xs text-rose-200 leading-relaxed capitalize">
                                {shp.disruption_type.replace('_', ' ')} detected causing a {shp.delay_hours}h bottleneck.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-gray-500 font-medium">
          Showing <span className="text-white font-bold">{paginatedShipments.length}</span> of <span className="text-white font-bold">{filteredShipments.length}</span> shipments
        </span>
        <div className="flex gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1.5 rounded bg-[#111827] border border-white/10 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <div className="flex items-center px-4 text-xs font-mono text-blue-400 font-bold">
            {currentPage} / {totalPages || 1}
          </div>
          <button 
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1.5 rounded bg-[#111827] border border-white/10 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Helpers
const getCountryEmoji = (country: string) => {
  const flags: Record<string, string> = {
    'China': '🇨🇳', 'USA': '🇺🇸', 'India': '🇮🇳', 'Netherlands': '🇳🇱', 
    'UAE': '🇦🇪', 'Germany': '🇩🇪', 'Japan': '🇯🇵', 'UK': '🇬🇧', 
    'Brazil': '🇧🇷', 'Belgium': '🇧🇪', 'South Korea': '🇰🇷'
  };
  return flags[country] || '🌐';
};

const getModeIcon = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'air': return <Plane size={14} />;
    case 'sea': return <Ship size={14} />;
    case 'road': return <Truck size={14} />;
    case 'rail': return <Train size={14} />;
    default: return <Package size={14} />;
  }
};

const getCargoTypeStyle = (type: string) => {
  switch (type.toLowerCase()) {
    case 'electronics': return 'border-blue-500/20 text-blue-400 bg-blue-500/5';
    case 'pharmaceuticals': return 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5';
    case 'automotive': return 'border-gray-500/20 text-gray-400 bg-gray-500/5';
    case 'perishables': return 'border-orange-500/20 text-orange-400 bg-orange-500/5';
    default: return 'border-white/10 text-gray-500 bg-white/5';
  }
};

const getProgressColor = (status: string) => {
  switch (status) {
    case 'on_time': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    case 'at_risk': return 'bg-yellow-500';
    case 'delayed': return 'bg-orange-500';
    case 'critical': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
    default: return 'bg-gray-500';
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    on_time: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    at_risk: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    delayed: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    critical: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const getRelativeETA = (etaStr: string) => {
  const eta = new Date(etaStr);
  const now = new Date();
  const diffDays = Math.ceil((eta.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Arriving Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  return `in ${diffDays} days`;
};

export default Shipments;
