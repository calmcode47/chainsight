import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ExternalLink, 
  X,
  Loader2,
  ShieldCheck,
  Package
} from 'lucide-react';
import { getDisruptions, analyzeDisruptions } from '../api/client';
import { DisruptionAlert } from '../types';

const Disruptions: React.FC = () => {
  const [alerts, setAlerts] = useState<DisruptionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [filter, setFilter] = useState('All');

  const fetchData = async () => {
    try {
      const data = await getDisruptions();
      setAlerts(data);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const data = await analyzeDisruptions();
      setAiAnalysis(data);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredAlerts = alerts.filter(a => filter === 'All' || a.severity.toLowerCase() === filter.toLowerCase());

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
  };

  if (loading) return <div className="p-8 text-gray-500 animate-pulse font-mono uppercase tracking-widest text-xs">Scanning Global Logistics Nodes...</div>;

  return (
    <div className="space-y-8 relative">
      {/* Summary Stats & Action */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex gap-4 flex-wrap">
          <StatMini label="Total Alerts" value={stats.total} color="text-white" />
          <StatMini label="Critical" value={stats.critical} color="text-rose-500" />
          <StatMini label="High" value={stats.high} color="text-orange-500" />
          <StatMini label="Medium" value={stats.medium} color="text-yellow-500" />
        </div>

        <button 
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
        >
          {analyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {analyzing ? 'Processing Fleet Data...' : 'Run Gemini AI Analysis'}
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
              filter === sev 
              ? 'bg-white text-black border-white' 
              : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlerts.map((alert, idx) => (
          <div 
            key={alert.id}
            className="bg-[#111827] border border-white/10 rounded-lg p-6 relative overflow-hidden glass-card group hover:border-white/20 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getSeverityBg(alert.severity)}`} />
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${getSeverityText(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{alert.type}</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                <Clock size={12} /> {new Date(alert.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-xs font-bold text-blue-400 mb-1 cursor-pointer hover:underline flex items-center gap-1">
                <Package size={12} /> {alert.shipment_id}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {alert.description}
              </p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                <MapPin size={14} className="text-gray-600" /> {alert.affected_region}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500">
                <AlertTriangle size={14} /> Delay: {alert.predicted_delay_hours}h
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AI Confidence</span>
                <span className="text-[10px] font-bold text-blue-400">{(alert.ai_confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                  style={{ width: `${alert.ai_confidence * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all">
                View Shipment
              </button>
              <button className="flex-1 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all">
                Optimize Route
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Analysis Panel (Drawer) */}
      {aiAnalysis && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAiAnalysis(null)} />
          <div className="relative w-full max-w-lg bg-[#0A0F1E] border-l border-white/10 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#111827]">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Gemini AI Risk Assessment</h3>
                  <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Operational Intelligence v1.5</div>
                </div>
              </div>
              <button onClick={() => setAiAnalysis(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Overall Risk Confidence</span>
                  <span className="text-xl font-bold text-white">94%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '94%' }} />
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Top 5 Identification Risks</h4>
                {aiAnalysis.disruptions.map((risk: any, i: number) => (
                  <div key={i} className="bg-[#111827] border border-white/5 p-5 rounded-lg relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">0{i+1}. {risk.type}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getSeverityText(risk.severity)} bg-current/10`}>
                          {risk.severity}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {risk.affected_shipments.map((id: string) => (
                        <span key={id} className="text-[9px] font-mono font-bold bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5">{id}</span>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs text-gray-400 italic">"{risk.predicted_impact}"</p>
                      <div className="bg-white/5 p-3 rounded border border-white/5 flex items-start gap-3">
                        <ShieldCheck className="text-emerald-500 shrink-0" size={16} />
                        <div>
                          <div className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Recommended Recovery</div>
                          <p className="text-xs text-gray-300 font-medium leading-relaxed">{risk.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 border-t border-white/10 bg-[#111827] text-center">
              <p className="text-[10px] text-gray-500 font-medium">
                Analysis generated at {new Date().toLocaleString()} based on live fleet data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helpers
const StatMini = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="bg-[#111827] border border-white/10 px-4 py-2 rounded-lg glass-card min-w-[100px]">
    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
  </div>
);

const getSeverityBg = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'bg-rose-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-emerald-500';
    default: return 'bg-gray-500';
  }
};

const getSeverityText = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'text-rose-500';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-emerald-500';
    default: return 'text-gray-500';
  }
};

export default Disruptions;
