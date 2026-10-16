import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`p-8 text-center bg-white rounded-xl border border-slate-200/80 flex flex-col items-center justify-center my-4 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
