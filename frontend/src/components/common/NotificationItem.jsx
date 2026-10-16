import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'WARNING':
        return <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'INFO':
      default:
        return <Info className="w-5 h-5 text-brand-500 shrink-0" />;
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
        notification.read
          ? 'bg-white border-slate-200 opacity-80'
          : 'bg-brand-50/40 border-brand-200 shadow-xs'
      }`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className={`text-sm font-semibold ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
            {notification.title}
          </h4>
          <span className="text-[11px] text-slate-400 whitespace-nowrap">{notification.timestamp}</span>
        </div>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notification.message}</p>
        {!notification.read && onMarkAsRead && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 mt-2 inline-block"
          >
            Mark as read
          </button>
        )}
      </div>
    </div>
  );
};
