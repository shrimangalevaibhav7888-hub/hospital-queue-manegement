import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiveQueue } from '../hooks/useLiveQueue';
import { doctorApi } from '../api/doctorApi';
import { queueApi } from '../api/queueApi';
import { Doctor } from '../types';
import { CurrentPatientCard } from '../components/doctor/CurrentPatientCard';
import { DoctorQueueTable } from '../components/doctor/DoctorQueueTable';
import { ReportDelayModal } from '../components/doctor/ReportDelayModal';
import { ConsultationModal } from '../components/doctor/ConsultationModal';
import { WalkInRegisterModal } from '../components/receptionist/WalkInRegisterModal';
import { EmergencyInsertModal } from '../components/receptionist/EmergencyInsertModal';
import { BookAppointmentModal } from '../components/patient/BookAppointmentModal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  PhoneCall,
  Clock,
  AlertTriangle,
  Pause,
  Play,
  Users,
  CheckCircle2,
  UserX,
  RefreshCw,
  MapPin,
  Sparkles,
  Calendar,
  UserPlus,
  ShieldAlert,
  CalendarPlus,
  FileBarChart,
  Printer,
  Search,
  Bell,
  Stethoscope,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { format } from 'date-fns';

export const DoctorDashboard: React.FC = () => {
  const { user, doctorDetails } = useAuth();
  const doctorId = user?.doctorId || doctorDetails?.id;
  const { queueSummary, isLoading, error, refetch } = useLiveQueue(doctorId);

  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [completeVisitId, setCompleteVisitId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Quick Action Modal states
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);

  // Live dynamic clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    doctorApi.listAll().then(setDoctorsList).catch(() => {});
  }, []);

  const handleCallNext = async () => {
    if (!doctorId) return;
    setIsActionLoading(true);
    try {
      await queueApi.callNext(doctorId);
      refetch();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStartConsultation = async (visitId: string) => {
    setIsActionLoading(true);
    try {
      await queueApi.startConsultation(visitId);
      refetch();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkNoShow = async (visitId: string) => {
    if (window.confirm('Mark this patient as No-Show? They will be removed from the current active call.')) {
      setIsActionLoading(true);
      try {
        await queueApi.markNoShow(visitId, 'Patient did not arrive when called');
        refetch();
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleTogglePause = async () => {
    if (!doctorId || !queueSummary) return;
    setIsActionLoading(true);
    try {
      if (queueSummary.doctorStatus === 'ON_BREAK' || queueSummary.status === 'PAUSED') {
        await queueApi.resumeQueue(doctorId);
      } else {
        await queueApi.pauseQueue(doctorId, 'Doctor on 15-minute clinical break');
      }
      refetch();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 max-w-[1600px] mx-auto">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  const isOnBreak = queueSummary?.doctorStatus === 'ON_BREAK';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* 2-Column Responsive Workspace: Main Dashboard (8 cols) + Right Utility Panel (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT / CENTER MAIN CONTENT (xl:col-span-8) */}
        {/* ========================================================================= */}
        <div className="xl:col-span-8 space-y-6">
          {/* Main Dashboard Welcome Banner */}
          <div className="hospital-card p-6 sm:p-7 bg-white border border-slate-200/90 shadow-soft relative overflow-hidden">
            {/* Soft decorative background medical pulse */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-50/50 to-transparent pointer-events-none" />

            <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                    OPD Clinical Suite
                  </span>
                  <StatusBadge status={queueSummary?.doctorStatus || 'AVAILABLE'} size="sm" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {getGreeting()}, {queueSummary?.doctorName || user?.name || 'Dr. Rajesh Sharma'}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="text-slate-700">{queueSummary?.specialization || 'Interventional Cardiology'}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    {queueSummary?.roomNumber || 'Room 201'}
                  </span>
                </div>

                <p className="text-xs italic text-slate-500 pt-1">
                  "Every patient is a story. Let's make it a healthier one."
                </p>
              </div>

              {/* Action Buttons in Banner */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => refetch()}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-soft"
                  title="Refresh Queue"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleTogglePause}
                  disabled={isActionLoading}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-soft ${
                    isOnBreak
                      ? 'bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  {isOnBreak ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isOnBreak ? 'Resume Queue' : 'Take Break'}</span>
                </button>

                <button
                  onClick={() => setIsDelayModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-soft"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {queueSummary && queueSummary.currentDelayMinutes > 0
                      ? `Delay: +${queueSummary.currentDelayMinutes}m`
                      : 'Report Delay'}
                  </span>
                </button>

                <button
                  onClick={handleCallNext}
                  disabled={isActionLoading || (queueSummary?.waitingCount || 0) === 0}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>CALL NEXT PATIENT</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5 Clean Hospital Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
            {/* 1. WAITING */}
            <div className="hospital-card p-4 bg-white border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  WAITING
                </span>
                <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-2">
                {queueSummary?.waitingCount ?? 0}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Patients in queue</p>
            </div>

            {/* 2. COMPLETED */}
            <div className="hospital-card p-4 bg-white border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  COMPLETED
                </span>
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono mt-2">
                {queueSummary?.completedCount ?? 0}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Today</p>
            </div>

            {/* 3. NO SHOWS */}
            <div className="hospital-card p-4 bg-white border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  NO SHOWS
                </span>
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <UserX className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono mt-2">
                {queueSummary?.noShowCount ?? 0}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Today</p>
            </div>

            {/* 4. TOTAL TOKENS */}
            <div className="hospital-card p-4 bg-white border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  TOTAL TOKENS
                </span>
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <HeartPulse className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono mt-2">
                {queueSummary?.totalTokens ?? 0}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Today</p>
            </div>

            {/* 5. AVG CONSULTATION */}
            <div className="hospital-card p-4 bg-white border border-slate-200/80 shadow-soft col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  AVG DURATION
                </span>
                <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-mono mt-2">
                {queueSummary?.avgConsultationDuration ?? 15}m
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Per consultation</p>
            </div>
          </div>

          {/* Active Consultation Card */}
          <CurrentPatientCard
            calledPatient={queueSummary?.currentlyCalling}
            activeConsultation={queueSummary?.inConsultation}
            onStartConsultation={handleStartConsultation}
            onOpenCompleteModal={(visitId) => setCompleteVisitId(visitId)}
            onMarkNoShow={handleMarkNoShow}
          />

          {/* Live Waiting Line Table */}
          <DoctorQueueTable
            items={queueSummary?.items || []}
            onCallPatient={handleStartConsultation}
            lastUpdated={format(currentTime, 'hh:mm:ss a')}
            onRefresh={refetch}
          />
        </div>

        {/* ========================================================================= */}
        {/* RIGHT UTILITY PANEL (xl:col-span-4) */}
        {/* ========================================================================= */}
        <div className="xl:col-span-4 space-y-6">
          {/* Dynamic Live Date / Time Card */}
          <div className="hospital-card p-5 bg-gradient-to-br from-white via-teal-50/20 to-blue-50/30 border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>{format(currentTime, 'EEE, dd MMM yyyy')}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Hospital System Clock
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {format(currentTime, 'hh:mm:ss')}
                  <span className="text-sm font-bold text-slate-500 ml-1.5 uppercase">
                    {format(currentTime, 'a')}
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Have a productive day!</p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-soft">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Section 1: Quick Actions (2x3 Grid) */}
          <div className="hospital-card p-5 bg-white border border-slate-200 shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3.5 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Quick Actions</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Add Walk-in */}
              <button
                onClick={() => setIsWalkInModalOpen(true)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-left transition-all group shadow-soft"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-teal-800">Add Walk-in</div>
                <div className="text-[10px] text-slate-400">Register new patient</div>
              </button>

              {/* Search Patient */}
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input) input.focus();
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition-all group shadow-soft"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Search className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-800">Search Patient</div>
                <div className="text-[10px] text-slate-400">Lookup PAT ID / Token</div>
              </button>

              {/* Schedule Appointment */}
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition-all group shadow-soft"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">Schedule Appt</div>
                <div className="text-[10px] text-slate-400">Book future visit</div>
              </button>

              {/* Emergency Intake */}
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-left transition-all group shadow-soft"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-rose-800">Emergency Intake</div>
                <div className="text-[10px] text-slate-400">Fast-track to Pos #1</div>
              </button>

              {/* View Reports */}
              <button
                onClick={() => {
                  window.location.hash = 'analytics';
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-left transition-all group shadow-soft"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <FileBarChart className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-purple-800">View Reports</div>
                <div className="text-[10px] text-slate-400">Analytics & KPIs</div>
              </button>

              {/* Print Queue */}
              <button
                onClick={() => window.print()}
                className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-left transition-all group shadow-soft"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Printer className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-amber-800">Print Queue</div>
                <div className="text-[10px] text-slate-400">Export paper list</div>
              </button>
            </div>
          </div>

          {/* Section 2: Hospital Announcements Card */}
          <div className="hospital-card p-5 bg-white border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-teal-600" />
                <span>Hospital Announcements</span>
              </h3>
              <span className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer">
                View All
              </span>
            </div>

            <div className="space-y-3">
              {/* Item 1 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">Blood Donation Camp</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                    20th Sep 2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Annual voluntary blood donation drive in Main Auditorium from 9 AM to 4 PM.
                </p>
              </div>

              {/* Item 2 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">OPD Timings Updated</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  New general OPD consultation window: 8:00 AM – 6:00 PM on weekdays.
                </p>
              </div>

              {/* Item 3 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">Cardiology Wing Maintenance</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                    18th Sep, 2 PM – 5 PM
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Scheduled server upgrade for echo lab stations. Please route cases to Room 204.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {doctorId && (
        <ReportDelayModal
          isOpen={isDelayModalOpen}
          onClose={() => setIsDelayModalOpen(false)}
          doctorId={doctorId}
          currentDelay={queueSummary?.currentDelayMinutes || 0}
          onDelayUpdated={refetch}
        />
      )}

      {completeVisitId && (
        <ConsultationModal
          isOpen={!!completeVisitId}
          onClose={() => setCompleteVisitId(null)}
          visitId={completeVisitId}
          onCompleted={() => {
            setCompleteVisitId(null);
            refetch();
          }}
        />
      )}

      <WalkInRegisterModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        doctors={doctorsList}
        onRegistered={refetch}
      />

      <EmergencyInsertModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        doctors={doctorsList}
        onInserted={refetch}
      />

      {user?.patientId && (
        <BookAppointmentModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          patientId={user.patientId}
          onBooked={refetch}
        />
      )}
    </div>
  );
};
