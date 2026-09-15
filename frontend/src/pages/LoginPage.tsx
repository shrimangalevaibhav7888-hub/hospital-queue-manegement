import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, Stethoscope, UserCheck, HeartPulse, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: 'Patient Portal',
      email: 'patient@craftverse.hospital',
      name: 'Arthur Pendelton (Token DR-S-004)',
      icon: HeartPulse,
      bg: 'bg-teal-50 text-teal-700 border-teal-200',
      badge: 'bg-teal-100/70 text-teal-800',
    },
    {
      role: 'Doctor Clinic Suite',
      email: 'dr.sharma@craftverse.hospital',
      name: 'Dr. Rajesh Sharma (Cardiology)',
      icon: Stethoscope,
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      badge: 'bg-blue-100/70 text-blue-800',
    },
    {
      role: 'Reception Desk',
      email: 'reception@craftverse.hospital',
      name: 'Marcus Brody (Front Desk)',
      icon: UserCheck,
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: 'bg-amber-100/70 text-amber-800',
    },
    {
      role: 'Hospital Executive',
      email: 'admin@craftverse.hospital',
      name: 'Eleanor Vance (Director)',
      icon: ShieldCheck,
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'bg-purple-100/70 text-purple-800',
    },
  ];

  const handleQuickLogin = async (demoEmail: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(demoEmail, 'Password123!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20 mx-auto mb-3">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          CareFlow <span className="text-teal-600">Health</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Intelligent Hospital Patient Queue & Smart Arrival Platform
        </p>
      </div>

      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: 1-Click Demo Logins (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200 inline-block mb-1">
                  1-Click Role Switcher
                </span>
                <h2 className="text-lg font-bold text-slate-900">Select a Demo Experience</h2>
              </div>
              <Sparkles className="w-5 h-5 text-teal-600" />
            </div>

            <div className="space-y-3">
              {demoAccounts.map((acc, idx) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickLogin(acc.email)}
                    disabled={isLoading}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 transition-all group flex items-center justify-between shadow-soft"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${acc.bg} shadow-soft`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${acc.badge} inline-block mb-0.5`}>
                          {acc.role}
                        </span>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                          {acc.name}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Credentials Login Card (5 cols) */}
        <div className="md:col-span-5">
          <div className="hospital-card p-6 sm:p-7 bg-white border border-slate-200 shadow-soft">
            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-900">Sign In with Credentials</h3>
              <p className="text-xs text-slate-500 mt-0.5">Demo Password: <code className="text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-mono">Password123!</code></p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@craftverse.hospital"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-soft transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Signing In...' : 'Sign In to Hospital Portal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
