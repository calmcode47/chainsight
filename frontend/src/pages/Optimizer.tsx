import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck,
  Loader2,
  Box,
  Route as RouteIcon
} from 'lucide-react';
import { getShipments, optimizeRoute } from '../api/client';
import { Shipment, RouteRecommendation } from '../types';

const Optimizer: React.FC = () => {
  const [atRiskShipments, setAtRiskShipments] = useState<Shipment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<RouteRecommendation | null>(null);
  const [batchResults, setBatchResults] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getShipments();
      setAtRiskShipments(data.filter(s => s.status === 'delayed' || s.status === 'critical'));
    };
    fetchData();
  }, []);

  const handleOptimize = async (id: string) => {
    setSelectedId(id);
    setLoading(true);
    setRecommendation(null);
    try {
      const res = await optimizeRoute(id);
      setRecommendation(res);
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedShipment = atRiskShipments.find(s => s.id === selectedId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">AI Route Optimizer</h2>
        <p className="text-sm text-gray-500">
          Leveraging <span className="text-blue-400 font-bold">Gemini 1.5 Flash</span> to dynamically reroute cargo based on real-time port congestion and weather patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 h-[600px]">
        {/* LEFT PANEL: Shipments Needing Optimization */}
        <div className="lg:col-span-4 bg-[#111827] border border-white/10 rounded-lg flex flex-col overflow-hidden glass-card">
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Critical Pipeline</span>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">{atRiskShipments.length} At Risk</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {atRiskShipments.map(shp => (
              <div 
                key={shp.id}
                onClick={() => handleOptimize(shp.id)}
                className={`p-4 cursor-pointer transition-all group ${selectedId === shp.id ? 'bg-blue-500/10 border-r-4 border-r-blue-500' : 'hover:bg-white/5'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono font-bold text-white group-hover:text-blue-400 transition-colors">{shp.id}</span>
                  <span className="text-[10px] font-bold text-rose-500 uppercase">+{shp.delay_hours}h Delay</span>
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  {shp.origin.city} → {shp.destination.city}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 italic">
                    <AlertTriangle size={10} className="text-amber-500" />
                    {shp.disruption_type?.replace('_', ' ')}
                  </div>
                  <button className="text-[10px] font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    OPTIMIZE NOW →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Optimization Results */}
        <div className="lg:col-span-6 bg-[#111827] border border-white/10 rounded-lg flex flex-col overflow-hidden glass-card relative">
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <RouteIcon size={32} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-500 max-w-[240px]">Select a shipment from the pipeline to generate AI route recommendations.</p>
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <Loader2 size={48} className="text-blue-500 animate-spin" />
                <Sparkles size={24} className="text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white animate-pulse">Gemini 1.5 Flash Analyzing Route...</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Evaluating 12 alternate logistics paths</div>
              </div>
            </div>
          ) : recommendation && (
            <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 custom-scrollbar">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">Recommended Strategy</h3>
                  <div className="text-xs text-blue-400 flex items-center gap-1.5 mt-1 font-medium">
                    <CheckCircle2 size={14} /> Higher efficiency route identified
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  {recommendation.recommended_carrier} Recommended
                </div>
              </div>

              {/* Comparison Timeline */}
              <div className="grid grid-cols-2 gap-12 relative py-4">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
                
                {/* Original Route */}
                <div className="space-y-6 text-right">
                  <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">Original Route (Disrupted)</div>
                  <div className="relative pr-6">
                    <XCircle size={14} className="absolute -right-[7px] top-1 text-rose-500 z-10 bg-[#111827]" />
                    <div className="text-xs font-bold text-white">{selectedShipment?.current_location.city}</div>
                    <div className="text-[10px] text-gray-500">Current Bottleneck</div>
                  </div>
                  <div className="relative pr-6">
                    <XCircle size={14} className="absolute -right-[7px] top-1 text-rose-500 z-10 bg-[#111827]" />
                    <div className="text-xs font-bold text-white">Port Alpha Hub</div>
                    <div className="text-[10px] text-gray-500">Congestion: 48h+</div>
                  </div>
                </div>

                {/* Recommended Route */}
                <div className="space-y-6">
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Optimized Route</div>
                  <div className="relative pl-6">
                    <CheckCircle2 size={14} className="absolute -left-[7px] top-1 text-emerald-500 z-10 bg-[#111827]" />
                    <div className="text-xs font-bold text-white">{recommendation.alternative_route[0].city}</div>
                    <div className="text-[10px] text-gray-500">Alternate Gateway</div>
                  </div>
                  <div className="relative pl-6">
                    <CheckCircle2 size={14} className="absolute -left-[7px] top-1 text-emerald-500 z-10 bg-[#111827]" />
                    <div className="text-xs font-bold text-white">{recommendation.alternative_route[1].city}</div>
                    <div className="text-[10px] text-gray-500">Clear Transit Path</div>
                  </div>
                </div>
              </div>

              {/* Metrics Comparison Table */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/5 p-4 rounded-lg">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Time Saved</div>
                  <div className="text-lg font-bold text-emerald-500 flex items-center gap-1">
                    <Clock size={16} /> {recommendation.time_saving_hours}h
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-lg">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Cost Delta</div>
                  <div className="text-lg font-bold text-white flex items-center gap-1">
                    <DollarSign size={16} /> {recommendation.cost_delta_usd < 0 ? `-$${Math.abs(recommendation.cost_delta_usd)}` : `+$${recommendation.cost_delta_usd}`}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-lg">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Risk Reduction</div>
                  <div className="text-lg font-bold text-emerald-500 flex items-center gap-1">
                    <ShieldCheck size={16} /> {recommendation.risk_reduction_percent}%
                  </div>
                </div>
              </div>

              {/* Gemini Reasoning */}
              <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-lg relative overflow-hidden group">
                <Sparkles size={16} className="absolute -right-1 -top-1 text-blue-500/20 group-hover:scale-150 transition-transform duration-700" />
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Box size={12} /> Gemini Reasoning
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">
                  "{recommendation.reasoning}"
                </p>
              </div>

              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20">
                <CheckCircle2 size={18} /> Accept & Apply Route Change
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BATCH OPTIMIZATION */}
      <div className="bg-[#111827] border border-white/10 rounded-lg p-6 glass-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-lg font-bold text-white">Multi-Shipment Batch Optimization</h3>
            <p className="text-xs text-gray-500 mt-1">Optimize all delayed and critical shipments in a single computational pass.</p>
          </div>
          <button className="bg-white text-black font-bold px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
            <Sparkles size={18} /> Run Batch Optimization
          </button>
        </div>
      </div>
    </div>
  );
};

export default Optimizer;
