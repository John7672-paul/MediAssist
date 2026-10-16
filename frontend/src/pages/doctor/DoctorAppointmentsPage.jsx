import React, { useState, useEffect } from 'react';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { appointmentService } from '../../services/api';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Calendar } from 'lucide-react';

export const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Upcoming');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAppointments('DOCTOR');
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleMarkCompleted = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'COMPLETED' } : a));
  };

  const filtered = appointments.filter(a => {
    if (activeTab === 'Upcoming') return a.status === 'UPCOMING';
    if (activeTab === 'Completed') return a.status === 'COMPLETED';
    if (activeTab === 'Cancelled') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Patient Appointments Queue</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Review patient appointments, consultation modes, and visit statuses</p>
      </div>

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
            {tab} Queue
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading patient queue..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={`No ${activeTab.toLowerCase()} appointments`}
          description="There are currently no patient visits matching this queue filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(apt => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              showPatientInfo
              onView={(a) => alert(`Viewing Patient Note for ${a.patientName}:\n${a.patientNote || 'No notes provided'}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
