import React, { useState } from 'react';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Avatar } from '../../components/common/Avatar';
import { Pagination } from '../../components/common/Pagination';
import { mockDoctors } from '../../utils/mockData';
import { Eye, Edit, ShieldCheck, ShieldAlert } from 'lucide-react';

export const AdminDoctorsPage = () => {
  const [doctorsList, setDoctorsList] = useState(
    mockDoctors.map(d => ({ ...d, status: 'ACTIVE' }))
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const toggleDoctorStatus = (id) => {
    setDoctorsList(prev => prev.map(doc => {
      if (doc.id === id) {
        const nextStatus = doc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...doc, status: nextStatus };
      }
      return doc;
    }));
  };

  const filtered = doctorsList.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase()) ||
    d.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Manage Doctors Registry</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">View registered medical practitioners, update credentials, and toggle account activation</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search doctor by name or specialty..."
          className="max-w-md"
        />
        <span className="text-xs font-semibold text-slate-500">{filtered.length} Doctors Registered</span>
      </div>

      {/* Table Container */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Doctor</th>
                <th className="py-3.5 px-4">Specialty</th>
                <th className="py-3.5 px-4">Experience</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Fee</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={doc.avatar} name={doc.name} size="md" />
                      <div>
                        <p className="font-bold text-slate-900">{doc.name}</p>
                        <p className="text-[11px] text-slate-400">{doc.qualification}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-brand-600">{doc.specialty}</td>
                  <td className="py-3.5 px-4">{doc.experience}</td>
                  <td className="py-3.5 px-4 max-w-xs truncate">{doc.location}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">₹{doc.consultationFee}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant={doc.status === 'ACTIVE' ? 'ghost' : 'outline'}
                        size="sm"
                        onClick={() => toggleDoctorStatus(doc.id)}
                      >
                        {doc.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
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
