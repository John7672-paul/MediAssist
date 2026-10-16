import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Bot,
  Search,
  Bell,
  UserCheck,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { DoctorCard } from '../../components/doctors/DoctorCard';
import { RescheduleModal } from '../../components/appointments/RescheduleModal';
import { CancelModal } from '../../components/appointments/CancelModal';
import { Button } from '../../components/common/Button';
import { appointmentService, doctorService } from '../../services/api';
import { LoadingState } from '../../components/common/LoadingState';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [apts, docs] = await Promise.all([
          appointmentService.getAppointments('PATIENT', user?.id),
          doctorService.getDoctors()
        ]);
        setAppointments(apts);
        setDoctors(docs.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const upcomingAppointment = appointments.find(a => a.status === 'UPCOMING');

  const handleRescheduleConfirm = async (id, date, time) => {
    await appointmentService.rescheduleAppointment(id, date, time);
    const updated = await appointmentService.getAppointments('PATIENT', user?.id);
    setAppointments(updated);
  };

  const handleCancelConfirm = async (id, reason) => {
    await appointmentService.cancelAppointment(id, reason);
    const updated = await appointmentService.getAppointments('PATIENT', user?.id);
    setAppointments(updated);
  };

  if (loading) return <LoadingState message="Loading your personal dashboard..." />;

  return (
    <div className="space-y-8">
      {/* Header Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-200">Patient Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Good morning, {user?.name?.split(' ')[0]}</h1>
          <p className="text-xs sm:text-sm text-brand-100 mt-1 max-w-xl">
            You have {upcomingAppointment ? '1 upcoming appointment scheduled' : 'no upcoming appointments scheduled for today'}.
          </p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={Search}
            onClick={() => navigate('/patient/doctors')}
            className="bg-white text-brand-700 hover:bg-brand-50"
          >
            Find Doctor
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Bot}
            onClick={() => navigate('/patient/ai-assistant')}
            className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold border-none"
          >
            Ask AI Assistant
          </Button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Appointment"
          value={upcomingAppointment ? upcomingAppointment.date : "None"}
          subtitle={upcomingAppointment ? upcomingAppointment.doctorName : "No active visit"}
          icon={Calendar}
          color="brand"
        />
        <StatCard
          title="Next Available Doctor"
          value="Today"
          subtitle="Dr. Priya Sharma (10:30 AM)"
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Appointments This Month"
          value={appointments.length.toString()}
          subtitle="Total recorded visits"
          icon={UserCheck}
          color="indigo"
        />
        <StatCard
          title="Unread Notifications"
          value="2"
          subtitle="Click to view alerts"
          icon={Bell}
          color="amber"
        />
      </div>

      {/* Main Spotlight Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spotlight Upcoming Appointment Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Upcoming Visit Spotlight</h2>
            <Link to="/patient/appointments" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all ({appointments.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingAppointment ? (
            <AppointmentCard
              appointment={upcomingAppointment}
              onView={(apt) => navigate(`/patient/appointments/${apt.id}`)}
              onReschedule={(apt) => setRescheduleTarget(apt)}
              onCancel={(apt) => setCancelTarget(apt)}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Upcoming Appointments</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need to see a doctor? Search top specialists or ask our AI Assistant to find open slots.
              </p>
              <Button size="sm" icon={Search} onClick={() => navigate('/patient/doctors')}>
                Book an Appointment
              </Button>
            </div>
          )}

          {/* Quick AI Assistant Feature Callout */}
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-teal-950 flex items-center gap-1.5">
                <span>Healthcare Navigation AI</span>
                <span className="px-2 py-0.5 text-[10px] bg-teal-200 text-teal-900 font-bold rounded-full">Assistant</span>
              </h3>
              <p className="text-xs text-teal-800 mt-1 leading-relaxed">
                Need help picking a dermatologist or checking weekend slot timings? Chat with the appointment assistant.
              </p>
              <button
                onClick={() => navigate('/patient/ai-assistant')}
                className="mt-3 text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                Start AI Chat <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Doctors Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recommended Doctors</h2>
            <Link to="/patient/doctors" className="text-xs font-semibold text-brand-600">See All</Link>
          </div>

          <div className="space-y-4">
            {doctors.map(doc => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onViewProfile={(id) => navigate(`/patient/doctors/${id}`)}
                onBookAppointment={(id) => navigate(`/patient/book-appointment?doctorId=${id}`)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
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
