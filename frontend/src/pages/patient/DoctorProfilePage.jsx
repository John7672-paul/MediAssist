import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Award,
  Building,
  Calendar as CalendarIcon,
  Clock,
  Video,
  UserCheck,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { DatePicker } from '../../components/common/DatePicker';
import { TimeSlotPicker } from '../../components/common/TimeSlotPicker';
import { LoadingState } from '../../components/common/LoadingState';
import { doctorService } from '../../services/api';

export const DoctorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2026-08-29');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        const docData = await doctorService.getDoctorById(id || 'doc-1');
        setDoctor(docData);
        if (docData.availableDates && docData.availableDates.length > 0) {
          setSelectedDate(docData.availableDates[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  useEffect(() => {
    if (doctor && selectedDate) {
      const slots = doctor.slots[selectedDate] || ["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM"];
      setAvailableSlots(slots);
      setSelectedSlot('');
    }
  }, [doctor, selectedDate]);

  const handleProceedToBooking = () => {
    navigate(`/patient/book-appointment?doctorId=${doctor.id}&date=${selectedDate}&time=${encodeURIComponent(selectedSlot)}`);
  };

  if (loading) return <LoadingState message="Loading doctor profile details..." />;
  if (!doctor) return <div className="p-8 text-center text-slate-500">Doctor not found.</div>;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/patient/doctors')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctor Search</span>
      </button>

      {/* Main Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row items-start gap-6">
        <Avatar
          src={doctor.avatar}
          name={doctor.name}
          size="xl"
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-brand-50 shadow-sm"
        />

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 px-2.5 py-1 bg-brand-50 rounded-full border border-brand-100">
              {doctor.specialty}
            </span>
            <div className="flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
              <span>{doctor.rating}</span>
              <span className="text-slate-400 font-normal">({doctor.reviewsCount} verified reviews)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{doctor.name}</h1>
          <p className="text-sm font-medium text-slate-600">{doctor.qualification}</p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Award className="w-4 h-4 text-brand-600" />
              <span>{doctor.experience}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{doctor.hospital}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>{doctor.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Column Body: Profile Bio vs Interactive Booking Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: About & Fee Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <h2 className="text-lg font-bold text-slate-900 mb-3">About Doctor</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{doctor.about}</p>

            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Consultation Fee</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{doctor.consultationFee}</p>
                <p className="text-[11px] text-slate-400">Includes follow-up access</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Available Modes</span>
                <div className="flex items-center gap-2 mt-2">
                  {doctor.consultationTypes.map((type) => (
                    <Badge key={type} variant="brand" size="md">
                      {type === 'Online' ? <Video className="w-3.5 h-3.5 mr-1 inline" /> : <UserCheck className="w-3.5 h-3.5 mr-1 inline" />}
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Schedule & Slot Reservation */}
        <div className="space-y-6">
          <Card padding="lg" className="border-brand-200 shadow-md">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Book Appointment</h2>

            <div className="space-y-5">
              <DatePicker
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                availableDates={doctor.availableDates}
              />

              <TimeSlotPicker
                slots={availableSlots}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
              />

              <div className="pt-4 border-t border-slate-100 space-y-3">
                {selectedSlot ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Selected Slot: <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong></span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center">Please choose a date and time slot above.</p>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  disabled={!selectedSlot}
                  onClick={handleProceedToBooking}
                  className="w-full shadow-sm"
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
