import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

interface LoadingScreenProps {
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  return (
    <div className={`
      fixed inset-0 z-[9999] bg-[#0A0F1E] flex flex-col items-center justify-center transition-all duration-700
      ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `}>
      <div className="relative">
        {/* Animated Rings */}
        <div className="absolute inset-0 w-32 h-32 border-4 border-blue-500/10 rounded-full animate-ping" />
        <div className="absolute -inset-4 w-40 h-40 border-2 border-blue-500/5 rounded-full animate-pulse" />
        
        <div className="relative w-32 h-32 bg-[#111827] border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/10">
          <LinkIcon className="text-blue-500 animate-chain-rotate" size={48} />
        </div>
      </div>

      <div className="mt-12 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-white animate-fade-in-up">
          ChainSight
        </h1>
        <div className="mt-2 flex items-center justify-center gap-1 text-gray-500 text-sm font-medium">
          <span>Connecting to supply chain network</span>
          <span className="flex gap-1">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-12 w-64 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div className="h-full bg-blue-600 animate-loading-progress rounded-full" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes chain-rotate {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(90deg); }
          50% { transform: rotate(180deg); }
          75% { transform: rotate(270deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes loading-progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-chain-rotate {
          animation: chain-rotate 4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        .animate-loading-progress {
          animation: loading-progress 2s ease-in-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default LoadingScreen;
