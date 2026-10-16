import React from 'react';
import { Star, MapPin, Award, Calendar, Video, UserCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

export const DoctorCard = ({ doctor, onViewProfile, onBookAppointment }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 p-5 flex flex-col justify-between">
      <div>
        {/* Top Info Header */}
        <div className="flex items-start gap-4">
          <Avatar
            src={doctor.avatar}
            name={doctor.name}
            size="xl"
            className="rounded-2xl border-2 border-brand-100"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                {doctor.specialty}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                <span>{doctor.rating}</span>
                <span className="text-slate-400 font-normal">({doctor.reviewsCount})</span>
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900 truncate mt-0.5">{doctor.name}</h3>
            <p className="text-xs text-slate-500 truncate">{doctor.qualification}</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
              <Award className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span>{doctor.experience}</span>
            </div>
          </div>
        </div>

        {/* Details & Location */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{doctor.location}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-slate-500">Consultation Fee</span>
            <span className="text-sm font-bold text-slate-900">₹{doctor.consultationFee}</span>
          </div>
        </div>

        {/* Consultation Types */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {doctor.consultationTypes.map((type) => (
            <Badge key={type} variant={type === 'Online' ? 'brand' : 'neutral'} size="sm">
              {type === 'Online' ? <Video className="w-3 h-3 mr-1 inline" /> : <UserCheck className="w-3 h-3 mr-1 inline" />}
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Action CTAs */}
      <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(doctor.id)}
          className="w-full"
        >
          View Profile
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={Calendar}
          onClick={() => onBookAppointment(doctor.id)}
          className="w-full"
        >
          Book Slot
        </Button>
      </div>
    </div>
  );
};
