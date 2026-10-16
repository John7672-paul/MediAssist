import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

export const DoctorFilter = ({
  specialty,
  onSpecialtyChange,
  consultationType,
  onConsultationTypeChange,
  location,
  onLocationChange,
  onResetFilters,
  specialtyOptions = [],
  locationOptions = []
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-subtle flex flex-col md:flex-row items-stretch md:items-end gap-3">
      <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider md:mb-2.5">
        <Filter className="w-4 h-4 text-brand-600" />
        <span>Filters:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
        <Select
          label="Specialty"
          value={specialty}
          onChange={(e) => onSpecialtyChange(e.target.value)}
          options={['All Specialties', ...specialtyOptions]}
          placeholder="Filter specialty"
        />

        <Select
          label="Consultation Type"
          value={consultationType}
          onChange={(e) => onConsultationTypeChange(e.target.value)}
          options={['All', 'In Person', 'Online']}
          placeholder="Filter mode"
        />

        <Select
          label="Location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          options={['All Locations', ...locationOptions]}
          placeholder="Filter location"
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        icon={RotateCcw}
        onClick={onResetFilters}
        className="self-end text-xs text-slate-500 hover:text-slate-900"
      >
        Reset
      </Button>
    </div>
  );
};
