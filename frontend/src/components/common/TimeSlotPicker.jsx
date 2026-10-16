import React from 'react';
import { Clock } from 'lucide-react';

export const TimeSlotPicker = ({
  slots = [],
  selectedSlot,
  onSelectSlot,
  unavailableSlots = [],
  className = ''
}) => {
  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-brand-600" />
        <span>Available Time Slots</span>
      </label>

      {slots.length === 0 ? (
        <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500">
          No available slots for the selected date.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {slots.map((slot) => {
            const isSelected = selectedSlot === slot;
            const isUnavailable = unavailableSlots.includes(slot);

            return (
              <button
                key={slot}
                type="button"
                disabled={isUnavailable}
                onClick={() => onSelectSlot(slot)}
                className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border text-center transition-all ${
                  isUnavailable
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                    : isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50/50'
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
