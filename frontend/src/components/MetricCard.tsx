import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  changeType?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string; // e.g. "#3B82F6"
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  color 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]+/g, ""));

  useEffect(() => {
    const start = 0;
    const end = isNaN(numericValue) ? 0 : numericValue;
    if (start === end) return;

    const totalDuration = 1000;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(totalDuration / frameDuration);
    let counter = 0;

    const timer = setInterval(() => {
      counter++;
      const progress = counter / totalFrames;
      // Simple easeOutQuad
      const easedProgress = progress * (2 - progress);
      const current = start + (end - start) * easedProgress;
      
      setDisplayValue(current);

      if (counter === totalFrames) {
        clearInterval(timer);
        setDisplayValue(end);
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [numericValue]);

  const formattedValue = typeof value === 'string' && isNaN(numericValue) 
    ? value 
    : value.toString().includes('$') 
      ? `$${displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="bg-[#111827] border border-white/10 rounded-lg p-5 relative overflow-hidden group hover:border-white/20 transition-all duration-300 glass-card">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1 block">
            {title}
          </span>
          <h3 className="text-2xl font-bold tracking-tight text-white">
            {formattedValue}
          </h3>
        </div>
        <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <div className="flex items-center gap-1.5">
          {changeType === 'up' && <TrendingUp size={14} className="text-[#10B981]" />}
          {changeType === 'down' && <TrendingDown size={14} className="text-[#F43F5E]" />}
          {changeType === 'neutral' && <Minus size={14} className="text-gray-400" />}
          <span className={`text-xs font-bold ${
            changeType === 'up' ? 'text-[#10B981]' : 
            changeType === 'down' ? 'text-[#F43F5E]' : 'text-gray-400'
          }`}>
            {change}
          </span>
        </div>

        {/* Hardcoded 5-point sparkline SVG */}
        <div className="w-16 h-8 opacity-50 group-hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 100 40" className="w-full h-full">
            <path 
              d="M0 30 Q 25 10, 50 25 T 100 15" 
              fill="none" 
              stroke={color} 
              strokeWidth="3" 
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Background Accent Glow */}
      <div 
        className="absolute -right-4 -bottom-4 w-24 h-24 blur-[60px] opacity-10 rounded-full" 
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default MetricCard;
