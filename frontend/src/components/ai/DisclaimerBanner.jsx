import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner = ({ className = '' }) => {
  return (
    <div className={`p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 ${className}`}>
      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <span className="font-semibold">Healthcare Assistant Notice:</span> MediAssist AI Assistant provides appointment scheduling and platform navigation assistance. It does <span className="font-semibold underline decoration-amber-400">not</span> provide medical diagnoses or treatment advice.
      </div>
    </div>
  );
};
