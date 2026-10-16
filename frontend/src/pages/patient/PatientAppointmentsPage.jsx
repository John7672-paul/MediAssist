import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { RescheduleModal } from '../../components/appointments/RescheduleModal';
import { CancelModal } from '../../components/appointments/CancelModal';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const PatientAppointmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Upcoming'); // 'Upcoming' | 'Completed' | 'Cancelled'
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAppointments('PATIENT', user?.id);
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleRescheduleConfirm = async (id, date, time) => {
    await appointmentService.rescheduleAppointment(id, date, time);
    fetchAppointments();
  };

  const handleCancelConfirm = async (id, reason) => {
    await appointmentService.cancelAppointment(id, reason);
    fetchAppointments();
  };

  const filtered = appointments.filter(a => {
    if (activeTab === 'Upcoming') return a.status === 'UPCOMING';
    if (activeTab === 'Completed') return a.status === 'COMPLETED';
    if (activeTab === 'Cancelled') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Appointments</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">View, reschedule, or cancel your scheduled medical appointments</p>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {['Upcoming', 'Completed', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab} Visits
          </button>
        ))}
      </div>

      {/* Listing Content */}
      {loading ? (
        <LoadingState message="Loading your appointments..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={`No ${activeTab.toLowerCase()} appointments`}
          description={`You do not have any ${activeTab.toLowerCase()} visits on record.`}
          actionLabel={activeTab === 'Upcoming' ? 'Book Appointment' : undefined}
          onAction={activeTab === 'Upcoming' ? () => navigate('/patient/doctors') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(apt => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              onView={(a) => navigate(`/patient/appointments/${a.id}`)}
              onReschedule={(a) => setRescheduleTarget(a)}
              onCancel={(a) => setCancelTarget(a)}
            />
          ))}
        </div>
      )}

      {/* Dialog Modals */}
      {rescheduleTarget && (
        <RescheduleModal
          isOpen={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          appointment={rescheduleTarget}
          onConfirmReschedule={handleRescheduleConfirm}
        />
      )}

      {cancelTarget && (
        <CancelModal
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          appointment={cancelTarget}
          onConfirmCancel={handleCancelConfirm}
        />
      )}
    </div>
  );
};
