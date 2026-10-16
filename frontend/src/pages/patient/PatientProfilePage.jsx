import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';

export const PatientProfilePage = () => {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || 'John Smith',
    email: user?.email || 'john.smith@example.com',
    phone: user?.phone || '+91 98765 43210',
    dob: user?.dob || '1994-06-15',
    gender: user?.gender || 'Male',
    emailNotifs: true,
    smsNotifs: true
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      updateUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender
      });
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Patient Profile & Preferences</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage your account details and notification settings</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Avatar Card */}
        <Card padding="lg" className="flex items-center gap-4">
          <Avatar src={user?.avatar} name={formData.name} size="xl" className="w-20 h-20" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">{formData.name}</h3>
            <p className="text-xs text-slate-500">{formData.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
              Verified Patient Account
            </span>
          </div>
        </Card>

        {/* Personal Information */}
        <Card padding="lg" className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              icon={User}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              icon={Phone}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              icon={Calendar}
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={['Male', 'Female', 'Other', 'Prefer not to say']}
            />
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card padding="lg" className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Email Notifications (Reminders & Confirmations)</span>
              <input
                type="checkbox"
                checked={formData.emailNotifs}
                onChange={(e) => setFormData({ ...formData, emailNotifs: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">SMS Alerts & Reminders</span>
              <input
                type="checkbox"
                checked={formData.smsNotifs}
                onChange={(e) => setFormData({ ...formData, smsNotifs: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={Save} isLoading={loading}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
