import React from 'react';
import { DisruptionAlert } from '../types';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

interface Props {
  disruptions: DisruptionAlert[];
}

const DisruptionFeed: React.FC<Props> = ({ disruptions }) => {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <AlertTriangle className="text-destructive w-5 h-5" />
          Live Disruption Feed
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {disruptions.map((dis) => (
          <div key={dis.id} className="relative pl-6 border-l-2 border-border pb-1 last:pb-0">
            <div className={`
              absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-card
              ${dis.severity === 'critical' ? 'bg-destructive' : dis.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}
            `} />
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-bold">{dis.type}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(dis.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
              {dis.description}
            </p>
            <div className="flex items-center gap-1 text-[10px] font-medium text-primary">
              <MapPin className="w-3 h-3" />
              {dis.affected_region || 'Global'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisruptionFeed;
