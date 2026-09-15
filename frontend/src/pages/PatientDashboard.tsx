import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatientQueue } from '../hooks/usePatientQueue';
import { LiveTokenCard } from '../components/patient/LiveTokenCard';
import { QueueProgressBar } from '../components/patient/QueueProgressBar';
import { SmartArrivalCard } from '../components/patient/SmartArrivalCard';
import { TravelSettingsModal } from '../components/patient/TravelSettingsModal';
import { BookAppointmentModal } from '../components/patient/BookAppointmentModal';
import { OnlineCheckInModal } from '../components/patient/OnlineCheckInModal';
import { VisitHistoryList } from '../components/patient/VisitHistoryList';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { queueApi } from '../api/queueApi';
import { Calendar, UserCheck, Plus, RefreshCw, Sparkles, HeartPulse, ShieldCheck } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user, patientDetails, refreshUser } = useAuth();
  const patientId = user?.patientId || patientDetails?.id;
  const { patientView, isLoading, error, refetch } = usePatientQueue(patientId);

  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  const handleCancelVisit = async () => {
    if (!patientView?.visitId) return;
    if (window.confirm('Are you sure you want to cancel your queue visit for today?')) {
      try {
        await queueApi.cancelVisit(patientView.visitId, 'Cancelled by patient from portal');
        refetch();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Patient Header Banner */}
      <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
              <HeartPulse className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Welcome, {user?.name || 'Patient'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-mono text-xs font-bold">
                  {user?.patientCode || patientDetails?.patientCode || 'PAT-100024'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Live queue token tracking, smart departure recommendations & OPD schedule
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-soft"
            title="Refresh State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {!patientView && (
            <button
              onClick={() => setIsCheckInModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Check-In for Today</span>
            </button>
          )}
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Book Future Visit</span>
          </button>
        </div>
      </div>

      {/* Active Queue Section */}
      {patientView ? (
        <div className="space-y-6">
          {/* Progress Timeline */}
          <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Visit Lifecycle Progress
            </h3>
            <QueueProgressBar status={patientView.status} />
          </div>

          {/* Hero Live Token Card */}
          <LiveTokenCard
            view={patientView}
            onOpenTravelSettings={() => setIsTravelModalOpen(true)}
            onCancelVisit={handleCancelVisit}
          />

          {/* Smart Arrival Advisor */}
          <SmartArrivalCard
            view={patientView}
            onEditSettings={() => setIsTravelModalOpen(true)}
          />
        </div>
      ) : (
        <div className="hospital-card p-10 text-center border-dashed border-2 border-slate-300 bg-white shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Active Queue Visit for Today</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Check-in online right now to generate your live queue token and smart departure advisor, or schedule a future clinic appointment.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setIsCheckInModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Self Check-In & Get Token
            </button>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              Book Appointment
            </button>
          </div>
        </div>
      )}

      {/* Past Visit History */}
      <VisitHistoryList visits={patientDetails?.recentVisits || []} />

      {/* Modals */}
      {patientId && (
        <>
          <TravelSettingsModal
            isOpen={isTravelModalOpen}
            onClose={() => setIsTravelModalOpen(false)}
            patientId={patientId}
            initialTravelMinutes={patientView?.travelTimeMinutes || 25}
            initialBufferMinutes={patientView?.safetyBufferMinutes || 10}
            onSaved={() => {
              refetch();
              refreshUser();
            }}
          />

          <BookAppointmentModal
            isOpen={isBookModalOpen}
            onClose={() => setIsBookModalOpen(false)}
            patientId={patientId}
            onBooked={() => {
              refetch();
              refreshUser();
            }}
          />

          <OnlineCheckInModal
            isOpen={isCheckInModalOpen}
            onClose={() => setIsCheckInModalOpen(false)}
            patientId={patientId}
            patientCode={user?.patientCode || 'PAT-100024'}
            patientName={user?.name || 'Patient'}
            onCheckedIn={() => {
              refetch();
              refreshUser();
            }}
          />
        </>
      )}
    </div>
  );
};
