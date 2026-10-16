import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'Unable to load information at this time. Please check your connection and try again.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`p-8 text-center bg-rose-50/50 rounded-xl border border-rose-200 flex flex-col items-center justify-center my-4 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-rose-900">{title}</h3>
      <p className="text-xs sm:text-sm text-rose-700 max-w-sm mt-1 mb-4">{description}</p>
      {onRetry && (
        <Button size="sm" variant="outline" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
