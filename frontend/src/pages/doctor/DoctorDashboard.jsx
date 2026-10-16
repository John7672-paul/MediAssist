import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Users, Video, MapPin } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../../components/common/LoadingState';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocData = async () => {
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
    fetchDocData();
  }, []);

  const todayList = appointments;
  const upcomingCount = appointments.filter(a => a.status === 'UPCOMING').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  if (loading) return <LoadingState message="Loading doctor dashboard..." />;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">Doctor Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Welcome back, {user?.name || 'Dr. Priya Sharma'}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            You have {todayList.length} patient appointments scheduled today.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Clock} onClick={() => navigate('/doctor/availability')}>
          Manage Slot Schedule
        </Button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={todayList.length.toString()}
          subtitle="Scheduled for today"
          icon={Calendar}
          color="brand"
        />
        <StatCard
          title="Upcoming Appointments"
          value={upcomingCount.toString()}
          subtitle="Pending visits"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Completed Appointments"
          value={completedCount.toString()}
          subtitle="Finished consultations"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Total Patients"
          value="48"
          subtitle="Assigned under care"
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Today's Schedule Table/List */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Today's Schedule Queue</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>
            View All Queue
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {todayList.map((apt) => (
            <div key={apt.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-slate-100 font-bold text-xs text-slate-800 rounded-lg whitespace-nowrap">
                  {apt.time}
                </span>
                <Avatar name={apt.patientName} size="md" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{apt.patientName}</h4>
                  <p className="text-xs text-slate-500">{apt.patientPhone} • {apt.patientNote || 'General Checkup'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  {apt.type === 'Online' ? <Video className="w-3.5 h-3.5 text-indigo-500" /> : <MapPin className="w-3.5 h-3.5 text-rose-500" />}
                  {apt.type}
                </span>
                <StatusBadge status={apt.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
