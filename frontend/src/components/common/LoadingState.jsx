import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading data...', className = '' }) => {
  return (
    <div className={`p-12 text-center flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>
    </div>
  );
};
