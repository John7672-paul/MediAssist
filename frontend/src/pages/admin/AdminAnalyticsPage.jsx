import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card } from '../../components/common/Card';
import { AppointmentTrendChart, StatusDistributionChart } from '../../components/dashboard/SimpleChart';
import { adminService } from '../../services/api';
import { LoadingState } from '../../components/common/LoadingState';
import { Calendar, CheckCircle2, XCircle, UserCheck, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await adminService.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingState message="Loading deep analytics reporting..." />;

  const { summary, appointmentsOverTime, statusDistribution, specialtyDistribution } = analytics;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">System Analytics & Growth Metrics</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Comprehensive breakdown of appointments, doctor specializations, and patient conversion</p>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Appointments"
          value={summary.totalAppointments.toLocaleString()}
          subtitle="All-time bookings"
          icon={Calendar}
          color="brand"
        />
        <StatCard
          title="Completed"
          value="3,598"
          subtitle="94.2% success rate"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Cancelled"
          value="222"
          subtitle="5.8% drop rate"
          icon={XCircle}
          color="amber"
        />
        <StatCard
          title="Active Doctors"
          value={summary.totalDoctors.toString()}
          subtitle="Available for slots"
          icon={UserCheck}
          color="indigo"
        />
        <StatCard
          title="Active Patients"
          value={summary.totalPatients.toLocaleString()}
          subtitle="Registered accounts"
          icon={Users}
          color="brand"
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card padding="lg" className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Appointments Trend</h3>
            <p className="text-xs text-slate-500">Volume progression across the past 8 months</p>
          </div>
          <AppointmentTrendChart data={appointmentsOverTime} />
        </Card>

        <Card padding="lg" className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Appointment Status Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown ratio of finished vs upcoming visits</p>
          </div>
          <StatusDistributionChart data={statusDistribution} />
        </Card>
      </div>

      {/* Specialty Distribution Bar Chart */}
      <Card padding="lg" className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Appointments by Specialty</h3>
          <p className="text-xs text-slate-500">Demand distribution across medical departments</p>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={specialtyDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <XAxis dataKey="specialty" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Appointments Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
