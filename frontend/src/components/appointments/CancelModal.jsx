import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { AlertTriangle } from 'lucide-react';

export const CancelModal = ({
  isOpen,
  onClose,
  appointment,
  onConfirmCancel
}) => {
  const [reason, setReason] = useState('Schedule Conflict');
  const [loading, setLoading] = useState(false);

  const reasons = [
    'Schedule Conflict',
    'Found another doctor',
    'Health condition improved',
    'Financial reasons',
    'Other'
  ];

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirmCancel(appointment.id, reason);
    setLoading(false);
    onClose();
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Appointment"
    >
      <div className="space-y-4">
        <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Are you sure you want to cancel?</p>
            <p className="mt-0.5">
              Cancelling appointment with <span className="font-bold">{appointment.doctorName}</span> on{' '}
              {appointment.date} at {appointment.time}.
            </p>
          </div>
        </div>

        <Select
          label="Reason for Cancellation"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={reasons}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Keep Appointment
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={loading}
            onClick={handleConfirm}
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </Modal>
  );
};
