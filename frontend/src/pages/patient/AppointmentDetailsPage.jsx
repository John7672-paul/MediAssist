import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  FileText,
  ArrowLeft,
  RefreshCw,
  XCircle,
  Building,
  Phone
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Avatar } from '../../components/common/Avatar';
import { RescheduleModal } from '../../components/appointments/RescheduleModal';
import { CancelModal } from '../../components/appointments/CancelModal';
import { appointmentService } from '../../services/api';
import { LoadingState } from '../../components/common/LoadingState';

export const AppointmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAppointmentById(id || 'apt-101');
      setAppointment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleRescheduleConfirm = async (aptId, date, time) => {
    await appointmentService.rescheduleAppointment(aptId, date, time);
    fetchDetails();
  };

  const handleCancelConfirm = async (aptId, reason) => {
    await appointmentService.cancelAppointment(aptId, reason);
    fetchDetails();
  };

  if (loading) return <LoadingState message="Fetching appointment details..." />;
  if (!appointment) return <div className="p-8 text-center text-slate-500">Appointment record not found.</div>;

  const isUpcoming = appointment.status === 'UPCOMING';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/patient/appointments')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Appointments</span>
      </button>

      {/* Main Details Card */}
      <Card padding="lg" className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400 font-mono">Reference: {appointment.id}</span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">Appointment Summary</h1>
            <p className="text-xs text-slate-500">Booked on {appointment.bookingDate}</p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Doctor Information */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <Avatar src={appointment.doctorAvatar} name={appointment.doctorName} size="xl" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase text-brand-600">{appointment.specialty}</span>
            <h3 className="text-lg font-bold text-slate-900">{appointment.doctorName}</h3>
            <p className="text-xs text-slate-500 truncate">{appointment.location}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Fee</span>
            <span className="text-lg font-extrabold text-slate-900">₹{appointment.consultationFee}</span>
          </div>
        </div>

        {/* Schedule & Consultation Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Date & Time</span>
            </div>
            <p className="text-base font-bold text-slate-900 pt-1">{appointment.date}</p>
            <p className="text-xs text-slate-600 font-medium">{appointment.time}</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
              {appointment.type === 'Online' ? <Video className="w-4 h-4 text-indigo-500" /> : <MapPin className="w-4 h-4 text-rose-500" />}
              <span>Consultation Mode</span>
            </div>
            <p className="text-base font-bold text-slate-900 pt-1">{appointment.type}</p>
            <p className="text-xs text-slate-600 font-medium truncate">{appointment.location}</p>
          </div>
        </div>

        {/* Patient Information & Notes */}
        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Patient Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 block">Name</span>
              <span className="font-semibold">{appointment.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Phone</span>
              <span className="font-semibold">{appointment.patientPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Email</span>
              <span className="font-semibold">{appointment.patientEmail}</span>
            </div>
          </div>

          {appointment.patientNote && (
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                Patient Note:
              </span>
              <p className="leading-relaxed">{appointment.patientNote}</p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        {isUpcoming && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="danger" icon={XCircle} onClick={() => setCancelOpen(true)}>
              Cancel Appointment
            </Button>
            <Button variant="outline" icon={RefreshCw} onClick={() => setRescheduleOpen(true)}>
              Reschedule Time
            </Button>
          </div>
        )}
      </Card>

      {/* Modals */}
      {rescheduleOpen && (
        <RescheduleModal
          isOpen={rescheduleOpen}
          onClose={() => setRescheduleOpen(false)}
          appointment={appointment}
          onConfirmReschedule={handleRescheduleConfirm}
        />
      )}

      {cancelOpen && (
        <CancelModal
          isOpen={cancelOpen}
          onClose={() => setCancelOpen(false)}
          appointment={appointment}
          onConfirmCancel={handleCancelConfirm}
        />
      )}
    </div>
  );
};
