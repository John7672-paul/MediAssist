import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const DatePicker = ({
  selectedDate,
  onSelectDate,
  availableDates = [],
  className = ''
}) => {
  // Pre-generate next 7 days if none provided
  const dates = availableDates.length > 0 ? availableDates : (() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d.toISOString().split('T')[0]);
    }
    return arr;
  })();

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { dayName, dayNum, month };
  };

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
        <CalendarIcon className="w-4 h-4 text-brand-600" />
        <span>Select Date</span>
      </label>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {dates.map((dateStr) => {
          const { dayName, dayNum, month } = formatDateLabel(dateStr);
          const isSelected = selectedDate === dateStr;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`flex flex-col items-center justify-center min-w-[72px] px-3 py-2.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50/50'
              }`}
            >
              <span className={`text-xs font-medium ${isSelected ? 'text-brand-100' : 'text-slate-500'}`}>
                {dayName}
              </span>
              <span className="text-lg font-bold tracking-tight my-0.5">{dayNum}</span>
              <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                {month}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
