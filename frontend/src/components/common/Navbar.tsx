import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ConnectionStatus } from './ConnectionStatus';
import { NotificationBell } from './NotificationBell';
import { Activity, LogOut, User as UserIcon, Tv, ShieldCheck, Stethoscope, UserCheck, HeartPulse } from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'DOCTOR':
        return <Stethoscope className="w-4 h-4 text-blue-400" />;
      case 'RECEPTIONIST':
        return <UserCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <HeartPulse className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-900/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 shadow-lg shadow-brand-500/20 text-white font-bold">
            <Activity className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
                CareFlow
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30">
                Health
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Smart Patient Queue & Arrival</p>
          </div>
        </div>

        {/* Navigation Tabs (if admin/staff) */}
        {onTabChange && user && (user.role === 'ADMIN' || user.role === 'RECEPTIONIST') && (
          <div className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => onTabChange('queue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'queue' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Doctor Queues
            </button>
            <button
              onClick={() => onTabChange('reception')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reception' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reception Desk
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => onTabChange('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'audit' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit Trail
            </button>
          </div>
        )}

        {/* Right side widgets */}
        <div className="flex items-center gap-3">
          <ConnectionStatus />

          {/* Public TV Board shortcut */}
          <a
            href="/#public-board"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = 'public-board';
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm"
            title="Open Hospital Waiting Room Display"
          >
            <Tv className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Waiting Room Display</span>
          </a>

          {user && <NotificationBell />}

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1 font-mono">
                  {getRoleIcon()}
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-300 border border-slate-700/60 text-slate-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <a
              href="/#login"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'login';
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/20 transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login / Portal</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
