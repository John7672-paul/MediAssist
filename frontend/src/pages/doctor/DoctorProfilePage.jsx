import React, { useState } from 'react';
import { User, Award, MapPin, DollarSign, Save, CheckCircle2, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';

export const DoctorProfilePage = () => {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || 'Dr. Priya Sharma',
    specialty: user?.specialty || 'Dermatology',
    qualification: user?.qualification || 'MBBS, MD (Dermatology)',
    experience: user?.experience || '8 years experience',
    location: user?.location || 'Hyderabad (Banjara Hills)',
    consultationFee: user?.consultationFee || 500,
    about: 'Senior dermatologist specializing in clinical and aesthetic skin health management.'
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      updateUserProfile(formData);
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Doctor Profile Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage public profile information visible to patients</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Doctor profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card padding="lg" className="flex items-center gap-4">
          <Avatar src={user?.avatar} name={formData.name} size="xl" className="w-20 h-20 border-2 border-brand-200" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">{formData.name}</h3>
            <p className="text-xs text-brand-600 font-semibold">{formData.specialty}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified Doctor Badge
            </span>
          </div>
        </Card>

        <Card padding="lg" className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Professional Profile</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Doctor Name"
              icon={User}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Select
              label="Primary Specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              options={['Dermatology', 'General Physician', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology']}
            />

            <Input
              label="Qualifications"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              required
            />

            <Input
              label="Experience"
              icon={Award}
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              required
            />

            <Input
              label="Clinic Location"
              icon={MapPin}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />

            <Input
              label="Consultation Fee (₹)"
              type="number"
              value={formData.consultationFee}
              onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold uppercase text-slate-700">About Bio</label>
            <textarea
              rows={4}
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={Save} isLoading={loading}>
            Save Doctor Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
