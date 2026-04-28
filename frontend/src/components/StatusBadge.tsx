import React from 'react';

type StatusType = 'on_time' | 'at_risk' | 'delayed' | 'critical' | 'low' | 'medium' | 'high';

interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status.toLowerCase().replace('_', ' ');
  
  const getColors = (s: string) => {
    switch (s) {
      case 'on_time':
      case 'low':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'at_risk':
      case 'medium':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'delayed':
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'critical':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getColors(status)}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
      <span>{normalizedStatus}</span>
    </div>
  );
};

export default StatusBadge;
