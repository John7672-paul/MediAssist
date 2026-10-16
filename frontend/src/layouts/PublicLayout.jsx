import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';

export const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* Navbar Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Medi<span className="text-brand-600">Assist</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How It Works</a>
            <a href="#ai-assistant" className="hover:text-brand-600 transition-colors">AI Assistant</a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-6 space-y-4">
            <nav className="flex flex-col space-y-3 font-medium text-slate-700">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#ai-assistant" onClick={() => setMobileMenuOpen(false)}>AI Assistant</a>
            </nav>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Button variant="outline" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                Sign In
              </Button>
              <Button variant="primary" onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 text-white font-bold text-lg mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span>MediAssist</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Healthcare appointments, simplified. Discover specialists, check live availability, and schedule visits seamlessly.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/patient/doctors" className="hover:text-white">Find Doctors</Link></li>
              <li><Link to="/patient/ai-assistant" className="hover:text-white">AI Assistant</Link></li>
              <li><Link to="/login" className="hover:text-white">Patient Portal</Link></li>
              <li><Link to="/login" className="hover:text-white">Doctor Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Specialties</h4>
            <ul className="space-y-2 text-xs">
              <li>Dermatology</li>
              <li>General Physician</li>
              <li>Cardiology</li>
              <li>Pediatrics</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Notice</h4>
            <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-850 p-3 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <p>MediAssist AI provides appointment & navigation assistance only. It does not provide medical diagnosis.</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2026 MediAssist Health Technologies. All rights reserved. B.Tech Portfolio Project.
        </div>
      </footer>
    </div>
  );
};
