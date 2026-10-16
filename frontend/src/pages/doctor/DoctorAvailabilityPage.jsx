import React, { useState } from 'react';
import { Clock, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { mockAvailability } from '../../utils/mockData';

export const DoctorAvailabilityPage = () => {
  const [slotDuration, setSlotDuration] = useState('30');
  const [schedule, setSchedule] = useState(mockAvailability.schedule);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleToggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        active: !prev[day]?.active
      }
    }));
  };

  const handleTimeChange = (day, field, val) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: val
      }
    }));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Availability & Time Slots</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Configure your weekly operating hours and consultation slot duration</p>
        </div>
        <Button variant="primary" icon={Save} onClick={handleSave}>
          Save Availability
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Weekly schedule availability updated successfully!</span>
        </div>
      )}

      {/* Slot Duration Selector */}
      <Card padding="lg" className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-600" />
          <span>Appointment Slot Duration</span>
        </h3>
        <p className="text-xs text-slate-500">Each patient appointment window will be calculated based on this interval:</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {['15', '30', '45', '60'].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => setSlotDuration(mins)}
              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                slotDuration === mins
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
              }`}
            >
              {mins} Minutes
            </button>
          ))}
        </div>
      </Card>

      {/* Weekly Schedule Grid */}
      <Card padding="lg" className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Weekly Availability Schedule</h3>

        <div className="space-y-3">
          {daysOfWeek.map((day) => {
            const dayConfig = schedule[day] || { active: false, startTime: '09:00', endTime: '13:00' };
            return (
              <div
                key={day}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  dayConfig.active ? 'bg-white border-slate-300 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-[140px]">
                  <input
                    type="checkbox"
                    checked={dayConfig.active}
                    onChange={() => handleToggleDay(day)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className={`text-sm font-bold ${dayConfig.active ? 'text-slate-900' : 'text-slate-500'}`}>
                    {day}
                  </span>
                </div>

                {dayConfig.active ? (
                  <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto">
                    <input
                      type="time"
                      value={dayConfig.startTime}
                      onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-brand-500/20"
                    />
                    <span>→</span>
                    <input
                      type="time"
                      value={dayConfig.endTime}
                      onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                    Unavailable
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
