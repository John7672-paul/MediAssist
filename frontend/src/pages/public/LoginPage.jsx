import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, Lock, Mail, UserCheck, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (res.user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError('Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    loginDemo(role);
    if (role === 'DOCTOR') navigate('/doctor/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/patient/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">MediAssist</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to your account</h2>
          <p className="text-xs text-slate-500">Manage appointments, schedules, and health visits</p>
        </div>

        {/* Demo Quick Selector Card */}
        <div className="bg-brand-50/90 border border-brand-200 rounded-2xl p-4 space-y-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-brand-800 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Prototype One-Click Demo Logins</span>
          </div>
          <p className="text-xs text-brand-700">Click any role to test portal functionality directly:</p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoLogin('PATIENT')}
              className="px-2.5 py-2 bg-white hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl text-xs font-semibold shadow-2xs transition-all text-center flex flex-col items-center"
            >
              <UserCheck className="w-4 h-4 text-brand-600 mb-1" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('DOCTOR')}
              className="px-2.5 py-2 bg-white hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl text-xs font-semibold shadow-2xs transition-all text-center flex flex-col items-center"
            >
              <Stethoscope className="w-4 h-4 text-brand-600 mb-1" />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('ADMIN')}
              className="px-2.5 py-2 bg-white hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl text-xs font-semibold shadow-2xs transition-all text-center flex flex-col items-center"
            >
              <Shield className="w-4 h-4 text-brand-600 mb-1" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Standard Form Card */}
        <Card padding="lg">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                Remember me
              </label>
              <a href="#" className="font-semibold text-brand-600 hover:text-brand-700">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>
        </Card>

        {/* Register Redirect */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
