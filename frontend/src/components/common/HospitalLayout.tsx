import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ConnectionStatus } from './ConnectionStatus';
import { NotificationBell } from './NotificationBell';
import {
  LayoutDashboard,
  Clock,
  Users,
  Calendar,
  FileText,
  Building2,
  BarChart3,
  Settings,
  Tv,
  LogOut,
  Search,
  Menu,
  X,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Activity,
  User,
} from 'lucide-react';

interface HospitalLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onSearch?: (query: string) => void;
  children: React.ReactNode;
}

export const HospitalLayout: React.FC<HospitalLayoutProps> = ({
  currentTab,
  onTabChange,
  onSearch,
  children,
}) => {
  const { user, doctorDetails, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const getDoctorRoleLabel = () => {
    if (user?.role === 'DOCTOR') {
      return doctorDetails?.specialization || 'Attending Physician';
    }
    if (user?.role === 'PATIENT') {
      return `Patient ID: ${user.patientCode || 'PAT-100024'}`;
    }
    if (user?.role === 'RECEPTIONIST') {
      return 'Front Desk & Triage Officer';
    }
    if (user?.role === 'ADMIN') {
      return 'Hospital Operations Director';
    }
    return 'Staff Member';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'queue', label: 'Live Queue', icon: Clock },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    onTabChange(id);
  };

  const isNavActive = (id: string) => {
    if (id === 'dashboard') {
      return ['dashboard', 'doctor', 'patient', 'reception', ''].includes(currentTab);
    }
    if (id === 'queue') return currentTab === 'queue';
    if (id === 'patients') return currentTab === 'patients';
    if (id === 'appointments') return currentTab === 'appointments';
    if (id === 'records') return currentTab === 'records' || currentTab === 'audit';
    if (id === 'departments') return currentTab === 'departments';
    if (id === 'reports') return currentTab === 'reports' || currentTab === 'analytics';
    if (id === 'settings') return currentTab === 'settings';
    return currentTab === id;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-soft">
        {/* Left: Mobile Toggle & Brand in Mobile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo in Top Header */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 leading-tight block">CareFlow</span>
              <span className="text-[10px] text-teal-600 font-semibold tracking-wide uppercase block">Health</span>
            </div>
          </div>
        </div>

        {/* Center: Large Patient Search Field */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient by name, token or phone number..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            />
          </form>
        </div>

        {/* Right Action Icons & Doctor/User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <ConnectionStatus />

          {/* Public Waiting Room TV Board Shortcut */}
          <a
            href="#public-board"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = 'public-board';
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-700 hover:text-teal-700 text-xs font-semibold transition-all shadow-soft"
            title="Open Hospital Waiting Room TV Display"
          >
            <Tv className="w-3.5 h-3.5 text-teal-600" />
            <span>Public TV</span>
          </a>

          <NotificationBell />

          {/* User / Doctor Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shadow-sm border border-teal-200">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                    <span>{user.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">
                    {getDoctorRoleLabel()}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-elevated py-2 z-50 animate-slide-up">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold text-[10px] border border-teal-100">
                      {user.role}
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        window.location.hash = 'public-board';
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Tv className="w-4 h-4 text-slate-400" />
                      <span>Waiting Room TV Board</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <a
              href="#login"
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Sign In
            </a>
          )}
        </div>
      </header>

      {/* Main Workspace with Fixed Left Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR (Desktop 250px + Mobile Drawer) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Top: Logo and Brand */}
          <div className="p-5">
            <div className="flex items-center gap-3 px-1 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight">CareFlow</h1>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    Health
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500">Hospital Queue & OPD</p>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Main Menu
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-teal-50/80 text-teal-800 font-bold shadow-soft border border-teal-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        active ? 'text-teal-700' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Bottom: Healthcare Illustration & Quote Card */}
          <div className="p-4 space-y-3">
            <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50/50 p-3.5 border border-teal-100 shadow-soft">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Better Care</h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Brighter Tomorrows for every patient in our care.
              </p>
            </div>

            {user && (
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
};
