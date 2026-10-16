import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card } from '../../components/common/Card';
import { AppointmentTrendChart, StatusDistributionChart } from '../../components/dashboard/SimpleChart';
import { adminService } from '../../services/api';
import { LoadingState } from '../../components/common/LoadingState';

export const AdminDashboard = () => {
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

  if (loading) return <LoadingState message="Loading platform admin metrics..." />;

  const { summary, appointmentsOverTime, statusDistribution } = analytics;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Admin Control Center</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Platform overview, operational statistics, and appointment health metrics</p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={summary.totalPatients.toLocaleString()}
          subtitle="Registered accounts"
          trend="+12% this month"
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Total Doctors"
          value={summary.totalDoctors.toString()}
          subtitle="Active medical providers"
          trend="4 specialties"
          icon={UserCheck}
          color="indigo"
        />
        <StatCard
          title="Total Appointments"
          value={summary.totalAppointments.toLocaleString()}
          subtitle="Processed platform visits"
          trend="+18% YoY"
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Completion Rate"
          value={summary.completionRate}
          subtitle="Successful visit ratio"
          trend="High performance"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card padding="lg" className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Appointment Trends (Monthly)</h3>
            <p className="text-xs text-slate-500">Total appointments booked vs completed visits over past 8 months</p>
          </div>
          <AppointmentTrendChart data={appointmentsOverTime} />
        </Card>

        <Card padding="lg" className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Appointment Status Breakdown</h3>
            <p className="text-xs text-slate-500">Distribution ratio of platform bookings</p>
          </div>
          <StatusDistributionChart data={statusDistribution} />
        </Card>
      </div>
    </div>
  );
};
