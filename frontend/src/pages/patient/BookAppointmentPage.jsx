import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  FileText,
  Video,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { DatePicker } from '../../components/common/DatePicker';
import { TimeSlotPicker } from '../../components/common/TimeSlotPicker';
import { Avatar } from '../../components/common/Avatar';
import { doctorService, appointmentService } from '../../services/api';
import { mockDoctors } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';

export const BookAppointmentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const doctorIdParam = searchParams.get('doctorId') || mockDoctors[0].id;
  const dateParam = searchParams.get('date') || '2026-08-29';
  const timeParam = searchParams.get('time') || '10:30 AM';

  const [step, setStep] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorIdParam);
  const [selectedDate, setSelectedDate] = useState(dateParam);
  const [selectedSlot, setSelectedSlot] = useState(timeParam);
  const [appointmentType, setAppointmentType] = useState('In Person');
  const [patientNote, setPatientNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const currentDoctor = mockDoctors.find(d => d.id === selectedDoctorId) || mockDoctors[0];
  const availableSlots = currentDoctor.slots[selectedDate] || ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"];

  const stepsList = [
    { num: 1, label: 'Doctor' },
    { num: 2, label: 'Date' },
    { num: 3, label: 'Time' },
    { num: 4, label: 'Mode' },
    { num: 5, label: 'Notes' },
    { num: 6, label: 'Summary' }
  ];

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const created = await appointmentService.createAppointment({
        patientId: user?.id || 'pat-1',
        patientName: user?.name || 'John Smith',
        patientEmail: user?.email || 'john@example.com',
        patientPhone: user?.phone || '+91 98765 43210',
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        specialty: currentDoctor.specialty,
        doctorAvatar: currentDoctor.avatar,
        date: selectedDate,
        time: selectedSlot,
        type: appointmentType,
        consultationFee: currentDoctor.consultationFee,
        location: appointmentType === 'Online' ? 'Online Video Link' : currentDoctor.location,
        patientNote
      });
      setBookingSuccess(created);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">Appointment Confirmed!</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Your appointment has been successfully scheduled. A confirmation email and notification have been sent.
          </p>
        </div>

        <Card padding="lg" className="bg-slate-50 text-left space-y-3 border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs text-slate-400">Appointment ID</span>
            <span className="text-xs font-bold text-slate-900">{bookingSuccess.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar src={currentDoctor.avatar} name={currentDoctor.name} size="lg" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">{currentDoctor.name}</h4>
              <p className="text-xs text-brand-600 font-medium">{currentDoctor.specialty}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 text-slate-700">
            <div>
              <span className="text-slate-400 block">Date & Time</span>
              <span className="font-semibold">{bookingSuccess.date} at {bookingSuccess.time}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Consultation Type</span>
              <span className="font-semibold">{bookingSuccess.type}</span>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate('/patient/appointments')}>
            View My Appointments
          </Button>
          <Button variant="primary" onClick={() => navigate('/patient/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Book an Appointment</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Complete the 6 simple steps to lock in your visit</p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {stepsList.map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              step === s.num
                ? 'bg-brand-600 text-white shadow-xs'
                : step > s.num
                ? 'text-brand-700 bg-brand-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-current flex items-center justify-center text-[10px]">
              {s.num}
            </span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step Contents */}
      <Card padding="lg">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step 1: Select Doctor</h3>
            <div className="space-y-3">
              {mockDoctors.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedDoctorId === doc.id
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={doc.avatar} name={doc.name} size="lg" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-xs text-brand-600">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-400">{doc.location}</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">₹{doc.consultationFee}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step 2: Select Date</h3>
            <DatePicker
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              availableDates={currentDoctor.availableDates}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step 3: Select Time Slot</h3>
            <TimeSlotPicker
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step 4: Select Consultation Mode</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setAppointmentType('In Person')}
                className={`p-5 rounded-2xl border cursor-pointer text-center space-y-2 transition-all ${
                  appointmentType === 'In Person'
                    ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <MapPin className="w-8 h-8 text-rose-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900">In Person Consultation</h4>
                <p className="text-xs text-slate-500">Visit clinic at {currentDoctor.location}</p>
              </div>

              <div
                onClick={() => setAppointmentType('Online')}
                className={`p-5 rounded-2xl border cursor-pointer text-center space-y-2 transition-all ${
                  appointmentType === 'Online'
                    ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <Video className="w-8 h-8 text-indigo-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900">Online Video Consultation</h4>
                <p className="text-xs text-slate-500">Join secure video link sent before appointment</p>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step 5: Patient Consultation Note</h3>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-700">Medical Reason / Symptoms (Optional)</label>
              <textarea
                rows={4}
                value={patientNote}
                onChange={(e) => setPatientNote(e.target.value)}
                placeholder="Describe any symptoms or notes for the doctor..."
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-slate-900">Step 6: Review Booking Summary</h3>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-xs sm:text-sm text-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500 font-medium">Selected Doctor</span>
                <span className="font-bold text-slate-900">{currentDoctor.name} ({currentDoctor.specialty})</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500 font-medium">Appointment Date</span>
                <span className="font-bold text-slate-900">{selectedDate}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500 font-medium">Time Slot</span>
                <span className="font-bold text-slate-900">{selectedSlot}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500 font-medium">Consultation Type</span>
                <span className="font-bold text-slate-900">{appointmentType}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-700 font-bold text-base">Total Fee</span>
                <span className="font-extrabold text-xl text-brand-700">₹{currentDoctor.consultationFee}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          <Button
            variant="outline"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
          >
            Previous Step
          </Button>

          {step < 6 ? (
            <Button
              variant="primary"
              disabled={step === 3 && !selectedSlot}
              onClick={() => setStep(step + 1)}
            >
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              isLoading={loading}
              onClick={handleConfirmBooking}
            >
              Confirm Appointment
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
