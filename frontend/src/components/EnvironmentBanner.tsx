import React from 'react';

const EnvironmentBanner: React.FC = () => {
  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

  return (
    <div className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest h-2 flex items-center justify-center fixed top-0 left-0 right-0 z-[9999] opacity-80 hover:opacity-100 transition-opacity cursor-help" title={`API Base URL: ${baseUrl}`}>
      ⚠ Development Mode — API: {baseUrl}
    </div>
  );
};

export default EnvironmentBanner;
