import React, { useState } from 'react';
import { Shipment, RouteRecommendation } from '../types';
import { optimizeRoute } from '../api/client';
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  shipment: Shipment | null;
}

const OptimizerCard: React.FC<Props> = ({ shipment }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteRecommendation | null>(null);

  const handleOptimize = async () => {
    if (!shipment) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await optimizeRoute(shipment.id);
      setResult(res);
    } catch (error) {
      console.error("Optimization failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!shipment) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center flex flex-col items-center gap-4">
        <Sparkles className="w-12 h-12 text-primary/40" />
        <p className="text-sm text-muted-foreground">Select a shipment to run AI route optimization.</p>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-lg shadow-primary/5">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-primary w-5 h-5" />
        <h3 className="text-lg font-bold">AI Route Optimizer</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-card border border-border p-4 rounded-lg">
          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Current Target</div>
          <div className="text-sm font-bold flex justify-between">
            <span>{shipment.id}</span>
            <span className="text-primary">{shipment.carrier}</span>
          </div>
        </div>

        {result ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                <div className="text-[10px] uppercase font-bold text-green-500 mb-1">Time Saved</div>
                <div className="text-lg font-bold">{result.time_saving_hours}h</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                <div className="text-[10px] uppercase font-bold text-blue-500 mb-1">Risk Reduction</div>
                <div className="text-lg font-bold">{(result.risk_reduction_percent).toFixed(0)}%</div>
              </div>
            </div>

            <div className="bg-card border border-border p-4 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-3 flex items-center gap-2">
                Proposed Change
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">Original</div>
                  <div className="text-xs font-medium line-through decoration-destructive/50">{result.original_route?.summary || 'Standard Path'}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 text-center">
                  <div className="text-[10px] text-green-500 font-bold mb-1">Optimized</div>
                  <div className="text-xs font-bold">{result.alternative_route?.summary || 'AI Optimized Route'}</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed italic bg-card/50 p-3 rounded border border-border/50">
              "{result.gemini_reasoning}"
            </div>

            <button 
              onClick={() => setResult(null)}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              Apply Recommendation
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Analyze the current maritime and port disruption data to find the most efficient path for this shipment.
            </p>
            <button 
              onClick={handleOptimize}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Run AI Optimization
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizerCard;
