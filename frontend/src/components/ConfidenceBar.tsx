import React from 'react';

interface ConfidenceBarProps {
  value: number; // 0.0 - 1.0
  label: string;
}

const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ value, label }) => {
  const percentage = Math.round(value * 100);
  
  const getColor = (v: number) => {
    if (v < 0.5) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    if (v < 0.75) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-mono font-bold text-white">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${getColor(value)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ConfidenceBar;
