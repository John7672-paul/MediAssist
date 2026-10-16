import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../../components/common/SearchBar';
import { DoctorFilter } from '../../components/doctors/DoctorFilter';
import { DoctorCard } from '../../components/doctors/DoctorCard';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { doctorService } from '../../services/api';
import { Stethoscope } from 'lucide-react';

export const FindDoctorsPage = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All Specialties');
  const [consultationType, setConsultationType] = useState('All');
  const [location, setLocation] = useState('All Locations');

  const specialties = ['Dermatology', 'General Physician', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology'];
  const locations = ['Hyderabad', 'Bengaluru', 'Mumbai'];

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await doctorService.getDoctors({
        search,
        specialty,
        consultationType,
        location: location !== 'All Locations' ? location : undefined
      });
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [search, specialty, consultationType, location]);

  const handleReset = () => {
    setSearch('');
    setSpecialty('All Specialties');
    setConsultationType('All');
    setLocation('All Locations');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Find Doctors & Specialists</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search verified medical professionals, compare experience and fees, and reserve your visit slot.
        </p>
      </div>

      {/* Search Bar & Multi-Filter Controls */}
      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search doctors, specialties, or clinic locations..."
        />

        <DoctorFilter
          specialty={specialty}
          onSpecialtyChange={setSpecialty}
          consultationType={consultationType}
          onConsultationTypeChange={setConsultationType}
          location={location}
          onLocationChange={setLocation}
          onResetFilters={handleReset}
          specialtyOptions={specialties}
          locationOptions={locations}
        />
      </div>

      {/* Doctor Cards Listing Grid */}
      {loading ? (
        <LoadingState message="Fetching available doctors..." />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          description="We couldn't find any doctor matching your filter options. Try clearing filters or searching another keyword."
          actionLabel="Reset All Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onViewProfile={(id) => navigate(`/patient/doctors/${id}`)}
              onBookAppointment={(id) => navigate(`/patient/book-appointment?doctorId=${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
