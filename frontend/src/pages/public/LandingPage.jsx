import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Bot,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  Video,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { DisclaimerBanner } from '../../components/ai/DisclaimerBanner';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: "Smart Doctor Search",
      description: "Filter specialists by medical area, location, experience, and consultation fees instantly."
    },
    {
      icon: Calendar,
      title: "Real-Time Slot Booking",
      description: "View verified open time slots and book instantly without phone queues or waiting times."
    },
    {
      icon: Bot,
      title: "AI Healthcare Assistant",
      description: "Intelligent appointment assistant to help you discover doctors, check availability, and reschedule visits."
    },
    {
      icon: Video,
      title: "In-Person & Online Care",
      description: "Flexible consultation modes with clinic addresses or seamless virtual video links."
    }
  ];

  const workflowSteps = [
    {
      number: "01",
      title: "Find a Doctor",
      description: "Browse verified doctors across top medical specialties in your city."
    },
    {
      number: "02",
      title: "Choose a Time",
      description: "Inspect real-time available time slots and select what suits your schedule."
    },
    {
      number: "03",
      title: "Book Appointment",
      description: "Confirm details, add consultation notes, and lock in your appointment."
    },
    {
      number: "04",
      title: "Manage Your Visit",
      description: "Receive reminders, view status updates, and reschedule with one click."
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>AI-Powered Healthcare Appointment SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Healthcare appointments, <span className="text-brand-600">simplified.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Find the right doctor, discover available appointment slots, and manage your healthcare visits with the help of an AI-powered assistant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              variant="primary"
              icon={Search}
              onClick={() => navigate('/patient/doctors')}
              className="w-full sm:w-auto shadow-md hover:shadow-lg"
            >
              Find a Doctor
            </Button>
            <Button
              size="lg"
              variant="secondary"
              icon={Bot}
              onClick={() => navigate('/patient/ai-assistant')}
              className="w-full sm:w-auto border border-brand-200"
            >
              Try AI Assistant
            </Button>
          </div>

          {/* Key Metrics Banner */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-200/80 mt-10">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">500+</p>
              <p className="text-xs text-slate-500 font-medium">Verified Specialists</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">98%</p>
              <p className="text-xs text-slate-500 font-medium">On-Time Visits</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">24/7</p>
              <p className="text-xs text-slate-500 font-medium">AI Booking Helper</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">4.9/5</p>
              <p className="text-xs text-slate-500 font-medium">Patient Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Simple 4-Step Process</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">How MediAssist Works</h2>
            <p className="text-sm text-slate-500 mt-2">Book your specialist visit in under 2 minutes with end-to-end schedule clarity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step) => (
              <Card key={step.number} hoverEffect className="relative">
                <div className="text-3xl font-black text-brand-200 mb-3">{step.number}</div>
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Built for Patients & Doctors</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Product Features</h2>
          <p className="text-sm text-slate-500 mt-2">Modern healthcare scheduling tools engineered for seamless coordination.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card key={feat.title} padding="lg" hoverEffect className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">{feat.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* AI Assistant Introduction Spotlight */}
      <section id="ai-assistant" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-brand-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <Bot className="w-4 h-4 text-teal-400" />
              <span>Smart Appointment Navigation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Meet Your AI Appointment Assistant
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Ask questions in plain English like <span className="text-teal-300 font-medium italic">"Find a dermatologist tomorrow at 10 AM"</span> or <span className="text-teal-300 font-medium italic">"Reschedule my visit"</span>. The AI assistant quickly locates doctors and opens slot availability.
            </p>

            <DisclaimerBanner className="bg-slate-800/90 border-slate-700 text-amber-200" />

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={Sparkles}
                onClick={() => navigate('/patient/ai-assistant')}
                className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold border-none"
              >
                Launch AI Assistant Chat
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Demo Login Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-8 flex flex-col items-center gap-4">
          <h3 className="text-xl font-extrabold text-brand-950">Ready to Explore the Platform Prototype?</h3>
          <p className="text-xs sm:text-sm text-brand-800 max-w-xl">
            Test role-based experiences instantly using single-click Patient, Doctor, or Admin demo profiles.
          </p>
          <Button variant="primary" icon={ChevronRight} onClick={() => navigate('/login')}>
            Try Demo Portals Now
          </Button>
        </div>
      </section>
    </div>
  );
};
