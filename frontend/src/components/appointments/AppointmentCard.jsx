import React from 'react';
import { Calendar, Clock, MapPin, Video, Eye, RefreshCw, XCircle } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const AppointmentCard = ({
  appointment,
  onView,
  onReschedule,
  onCancel,
  showPatientInfo = false,
}) => {
  const isUpcoming = appointment.status === 'UPCOMING';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Card Top Banner */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <span className="text-xs text-slate-400 font-medium">ID: {appointment.id}</span>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Doctor or Patient Header */}
        <div className="flex items-start gap-3">
          <Avatar
            src={showPatientInfo ? undefined : appointment.doctorAvatar}
            name={showPatientInfo ? appointment.patientName : appointment.doctorName}
            size="lg"
            className="rounded-xl border border-brand-100"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-slate-900 truncate">
              {showPatientInfo ? appointment.patientName : appointment.doctorName}
            </h4>
            <p className="text-xs font-medium text-brand-600 truncate">
              {showPatientInfo ? appointment.patientPhone : appointment.specialty}
            </p>
            {showPatientInfo && (
              <p className="text-[11px] text-slate-400 truncate">{appointment.patientEmail}</p>
            )}
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="mt-4 bg-slate-50/80 rounded-lg p-3 flex flex-col gap-2 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-slate-900">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-900">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>{appointment.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 pt-1 border-t border-slate-200/60">
            {appointment.type === 'Online' ? (
              <Video className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            )}
            <span className="truncate">{appointment.location || appointment.type}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        {onView && (
          <Button variant="ghost" size="sm" icon={Eye} onClick={() => onView(appointment)}>
            View
          </Button>
        )}
        {isUpcoming && onReschedule && (
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => onReschedule(appointment)}>
            Reschedule
          </Button>
        )}
        {isUpcoming && onCancel && (
          <Button variant="danger" size="sm" icon={XCircle} onClick={() => onCancel(appointment)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
