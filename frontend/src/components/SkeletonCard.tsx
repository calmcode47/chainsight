import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-lg p-5 relative overflow-hidden glass-card">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="w-24 h-2 skeleton rounded" />
          <div className="w-32 h-6 skeleton rounded" />
        </div>
        <div className="w-10 h-10 skeleton rounded-lg" />
      </div>

      <div className="flex items-end justify-between">
        <div className="w-16 h-3 skeleton rounded" />
        <div className="w-16 h-8 skeleton rounded opacity-50" />
      </div>
    </div>
  );
};

export default SkeletonCard;
