import React, { useState } from 'react';
import { SearchBar } from '../../components/common/SearchBar';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { mockPatients } from '../../utils/mockData';

export const AdminPatientsPage = () => {
  const [patients, setPatients] = useState(mockPatients);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Manage Patient Registry</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Directory of registered patient users and consultation histories</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search patient by name, email, or phone..."
          className="max-w-md"
        />
        <span className="text-xs font-semibold text-slate-500">{filtered.length} Patients Recorded</span>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Gender / DOB</th>
                <th className="py-3.5 px-4">Visits</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {filtered.map((pat) => (
                <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={pat.name} size="md" />
                      <div>
                        <p className="font-bold text-slate-900">{pat.name}</p>
                        <p className="text-[11px] text-slate-400">Joined {pat.createdAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-900">{pat.email}</p>
                    <p className="text-[11px] text-slate-400">{pat.phone}</p>
                  </td>
                  <td className="py-3.5 px-4">{pat.gender} ({pat.dob})</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{pat.totalAppointments} visits</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={pat.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
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
