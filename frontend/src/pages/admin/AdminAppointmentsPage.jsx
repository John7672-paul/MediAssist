import React, { useState } from 'react';
import { SearchBar } from '../../components/common/SearchBar';
import { Select } from '../../components/common/Select';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { mockAppointments } from '../../utils/mockData';
import { Video, MapPin } from 'lucide-react';

export const AdminAppointmentsPage = () => {
  const [appointments] = useState(mockAppointments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const filtered = appointments.filter(a => {
    const matchSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) ||
                        a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
                        a.specialty.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Master Appointments Log</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Audit log of all platform appointment transactions across doctors and patients</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search by patient or doctor name..."
          className="sm:col-span-2"
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'UPCOMING', label: 'Upcoming' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' }
          ]}
        />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Ref ID</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Doctor & Specialty</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{apt.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{apt.patientName}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{apt.doctorName}</p>
                    <p className="text-[11px] text-brand-600 font-medium">{apt.specialty}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-900">{apt.date}</p>
                    <p className="text-[11px] text-slate-400">{apt.time}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      {apt.type === 'Online' ? <Video className="w-3.5 h-3.5 text-indigo-500" /> : <MapPin className="w-3.5 h-3.5 text-rose-500" />}
                      {apt.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={apt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <Pagination
            currentPage={page}
            totalPages={1}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
};
