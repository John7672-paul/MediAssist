import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';

export const PatientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.includes('/ai-assistant')) return 'AI Appointment Assistant';
    if (location.pathname.includes('/doctors')) return 'Find Doctors & Specialists';
    if (location.pathname.includes('/book-appointment')) return 'Book Appointment';
    if (location.pathname.includes('/appointments')) return 'My Appointments';
    if (location.pathname.includes('/notifications')) return 'Notification Center';
    if (location.pathname.includes('/profile')) return 'Patient Profile';
    return 'Patient Dashboard';
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} title={getTitle()} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
