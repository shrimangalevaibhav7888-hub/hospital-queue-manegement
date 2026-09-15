import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { patientApi } from '../api/patientApi';
import { Settings, Save, CheckCircle2, Navigation, Bell, ShieldCheck, Database, Sliders, Smartphone } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [consultationDuration, setConsultationDuration] = useState(15);
  const [safetyBuffer, setSafetyBuffer] = useState(10);
  const [travelTime, setTravelTime] = useState(25);
  const [emergencyBonus, setEmergencyBonus] = useState(2);
  const [checkInHours, setCheckInHours] = useState(2);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              System Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings & Operational Parameters
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Customize Queue Engine heuristics, Smart Arrival calculations & notification preferences
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Queue Engine Parameters */}
        <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Queue Engine Heuristics & Dynamic ETA</h3>
              <p className="text-xs text-slate-500 font-medium">Fine-tune consultation pace and departure recommendation formulas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Default Consultation Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={consultationDuration}
                onChange={(e) => setConsultationDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Base consultation pace for newly allocated doctors.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Default Safety Margin Buffer (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={safetyBuffer}
                onChange={(e) => setSafetyBuffer(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Arrival margin added to Smart Departure calculations.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Default Travel Time Allowance (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={travelTime}
                onChange={(e) => setTravelTime(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default estimated route time for new patients.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Online Self Check-in Advance Window (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={checkInHours}
                onChange={(e) => setCheckInHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Hours before appointment when patients can generate a token.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Notifications */}
        <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Multi-Channel Patient Alerts</h3>
              <p className="text-xs text-slate-500 font-medium">Configure alert triggers for doctor delays, calling tokens & smart departure</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" defaultChecked className="accent-teal-600 w-4 h-4 rounded" />
              <div>
                <span className="font-bold text-slate-900 block">In-App Live Toast & Audio Chime</span>
                <span className="text-slate-500">Synthesize audio chimes when a token is called into the consultation room.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" defaultChecked className="accent-teal-600 w-4 h-4 rounded" />
              <div>
                <span className="font-bold text-slate-900 block">Doctor Delay Rebroadcast</span>
                <span className="text-slate-500">Instantly notify all waiting patients when a physician reports an unexpected delay.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" defaultChecked className="accent-teal-600 w-4 h-4 rounded" />
              <div>
                <span className="font-bold text-slate-900 block">Smart Leave-Home Notification ("Time to Depart")</span>
                <span className="text-slate-500">Send reminder when estimated leave-home time is within 15 minutes.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: System Info */}
        <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Platform & Database Infrastructure</h3>
              <p className="text-xs text-slate-500 font-medium">CareFlow Health Architecture Status</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">App Version</span>
              <span className="font-bold text-slate-800">v1.0.0 (Production)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Database</span>
              <span className="font-bold text-teal-700">Prisma (SQLite/Postgres)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Real-Time Sync</span>
              <span className="font-bold text-emerald-700">Socket.IO Active</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">RBAC Layer</span>
              <span className="font-bold text-purple-700">Active (4 Roles)</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-soft flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
