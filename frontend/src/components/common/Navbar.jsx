import React from 'react';
import { Menu, Bell, Bot, Sparkles, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const Navbar = ({ onOpenSidebar, title = 'Dashboard' }) => {
  const { user, role, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = (newRole) => {
    loginDemo(newRole);
    if (newRole === 'PATIENT') navigate('/patient/dashboard');
    if (newRole === 'DOCTOR') navigate('/doctor/dashboard');
    if (newRole === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left Menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick AI Trigger for Patients */}
        {role === 'PATIENT' && (
          <Link
            to="/patient/ai-assistant"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Assistant</span>
          </Link>
        )}

        {/* Demo Role Selector Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-[11px] font-semibold">
          <button
            onClick={() => handleRoleSwitch('PATIENT')}
            className={`px-2 py-1 rounded-md transition-all ${
              role === 'PATIENT' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Patient
          </button>
          <button
            onClick={() => handleRoleSwitch('DOCTOR')}
            className={`px-2 py-1 rounded-md transition-all ${
              role === 'DOCTOR' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Doctor
          </button>
          <button
            onClick={() => handleRoleSwitch('ADMIN')}
            className={`px-2 py-1 rounded-md transition-all ${
              role === 'ADMIN' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Notifications Icon */}
        {role === 'PATIENT' && (
          <Link
            to="/patient/notifications"
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white"></span>
          </Link>
        )}
      </div>
    </header>
  );
};
