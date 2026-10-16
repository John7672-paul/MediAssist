import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { DatePicker } from '../common/DatePicker';
import { TimeSlotPicker } from '../common/TimeSlotPicker';
import { Button } from '../common/Button';

export const RescheduleModal = ({
  isOpen,
  onClose,
  appointment,
  onConfirmReschedule
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-08-30');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);

  const availableSlots = ["09:30 AM", "10:30 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:30 PM"];

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) return;
    setLoading(true);
    await onConfirmReschedule(appointment.id, selectedDate, selectedSlot);
    setLoading(false);
    onClose();
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      subtitle={`Doctor: ${appointment.doctorName} (${appointment.specialty})`}
    >
      <div className="space-y-5">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">Current Slot:</p>
          <p>{appointment.date} at {appointment.time}</p>
        </div>

        <DatePicker
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <TimeSlotPicker
          slots={availableSlots}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedDate || !selectedSlot}
            isLoading={loading}
            onClick={handleConfirm}
          >
            Confirm New Time
          </Button>
        </div>
      </div>
    </Modal>
  );
};
