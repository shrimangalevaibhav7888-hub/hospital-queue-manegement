import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { doctorApi } from '../api/doctorApi';
import { queueApi } from '../api/queueApi';
import { Doctor, CalculatedQueueItem } from '../types';
import { DoctorQueueTable } from '../components/doctor/DoctorQueueTable';
import { CurrentPatientCard } from '../components/doctor/CurrentPatientCard';
import { ReportDelayModal } from '../components/doctor/ReportDelayModal';
import { ConsultationModal } from '../components/doctor/ConsultationModal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Clock,
  Users,
  PhoneCall,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Stethoscope,
  Filter,
  Play,
  Pause,
  Tv,
} from 'lucide-react';
import { format } from 'date-fns';

export const LiveQueuePage: React.FC = () => {
  const { user, doctorDetails } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    user?.doctorId || doctorDetails?.id || ''
  );
  const [queueSummary, setQueueSummary] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [completeVisitId, setCompleteVisitId] = useState<string | null>(null);

  const { socket, joinDoctorRoom, joinPublicRoom } = useSocket();

  const fetchDoctorsAndQueue = async () => {
    try {
      const docs = await doctorApi.listAll();
      setDoctors(docs);

      let targetDocId = selectedDoctorId;
      if (!targetDocId && docs.length > 0) {
        targetDocId = docs[0].id;
        setSelectedDoctorId(targetDocId);
      }

      if (targetDocId) {
        const q = await queueApi.getDoctorQueue(targetDocId);
        setQueueSummary(q);
        joinDoctorRoom(targetDocId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorsAndQueue();
    joinPublicRoom();
  }, [selectedDoctorId]);

  // Real-time WebSocket updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      if (selectedDoctorId) {
        queueApi.getDoctorQueue(selectedDoctorId).then(setQueueSummary).catch(() => {});
      }
    };
    socket.on('queue.updated', handleUpdate);
    socket.on('queue.patient_called', handleUpdate);
    socket.on('doctor.status_changed', handleUpdate);
    return () => {
      socket.off('queue.updated', handleUpdate);
      socket.off('queue.patient_called', handleUpdate);
      socket.off('doctor.status_changed', handleUpdate);
    };
  }, [socket, selectedDoctorId]);

  const handleCallNext = async () => {
    if (!selectedDoctorId) return;
    setIsActionLoading(true);
    try {
      await queueApi.callNext(selectedDoctorId);
      const q = await queueApi.getDoctorQueue(selectedDoctorId);
      setQueueSummary(q);
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
      const q = await queueApi.getDoctorQueue(selectedDoctorId);
      setQueueSummary(q);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkNoShow = async (visitId: string) => {
    if (window.confirm('Mark this patient as No-Show?')) {
      setIsActionLoading(true);
      try {
        await queueApi.markNoShow(visitId, 'Patient did not arrive when called');
        const q = await queueApi.getDoctorQueue(selectedDoctorId);
        setQueueSummary(q);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleTogglePause = async () => {
    if (!selectedDoctorId || !queueSummary) return;
    setIsActionLoading(true);
    try {
      if (queueSummary.doctorStatus === 'ON_BREAK' || queueSummary.status === 'PAUSED') {
        await queueApi.resumeQueue(selectedDoctorId);
      } else {
        await queueApi.pauseQueue(selectedDoctorId, 'Clinical break');
      }
      const q = await queueApi.getDoctorQueue(selectedDoctorId);
      setQueueSummary(q);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const selectedDocObj = doctors.find((d) => d.id === selectedDoctorId);
  const isOnBreak = queueSummary?.doctorStatus === 'ON_BREAK';

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header with Doctor Clinic Switcher */}
      <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Live OPD Central Queue
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Live Consultation Queue Line
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time deterministic FIFO ordering, emergency priority fast-tracks & live calling
          </p>
        </div>

        {/* Clinic Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <Stethoscope className="w-4 h-4 text-teal-600 ml-1.5" />
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none pr-2 cursor-pointer"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization} ({d.roomNumber})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchDoctorsAndQueue}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition-colors shadow-soft"
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
            <span>{isOnBreak ? 'Resume' : 'Pause'}</span>
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
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-soft transition-all disabled:opacity-40 flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>CALL NEXT</span>
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="hospital-card p-4 bg-white border border-slate-200 shadow-soft">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Waiting</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-1">
            {queueSummary?.waitingCount ?? 0}
          </p>
        </div>

        <div className="hospital-card p-4 bg-white border border-slate-200 shadow-soft">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Completed</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono mt-1">
            {queueSummary?.completedCount ?? 0}
          </p>
        </div>

        <div className="hospital-card p-4 bg-white border border-slate-200 shadow-soft">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">No Shows</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-700 font-mono mt-1">
            {queueSummary?.noShowCount ?? 0}
          </p>
        </div>

        <div className="hospital-card p-4 bg-white border border-slate-200 shadow-soft">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Total Tokens</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono mt-1">
            {queueSummary?.totalTokens ?? 0}
          </p>
        </div>

        <div className="hospital-card p-4 bg-white border border-slate-200 shadow-soft col-span-2 sm:col-span-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Avg Consultation</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-mono mt-1">
            {queueSummary?.avgConsultationDuration ?? 15}m
          </p>
        </div>
      </div>

      {/* Current Active Patient */}
      <CurrentPatientCard
        calledPatient={queueSummary?.currentlyCalling}
        activeConsultation={queueSummary?.inConsultation}
        onStartConsultation={handleStartConsultation}
        onOpenCompleteModal={(visitId) => setCompleteVisitId(visitId)}
        onMarkNoShow={handleMarkNoShow}
      />

      {/* Live Queue Table */}
      <DoctorQueueTable
        items={queueSummary?.items || []}
        onCallPatient={handleStartConsultation}
        onRefresh={fetchDoctorsAndQueue}
        lastUpdated={format(new Date(), 'hh:mm:ss a')}
      />

      {/* Modals */}
      {selectedDoctorId && (
        <ReportDelayModal
          isOpen={isDelayModalOpen}
          onClose={() => setIsDelayModalOpen(false)}
          doctorId={selectedDoctorId}
          currentDelay={queueSummary?.currentDelayMinutes || 0}
          onDelayUpdated={fetchDoctorsAndQueue}
        />
      )}

      {completeVisitId && (
        <ConsultationModal
          isOpen={!!completeVisitId}
          onClose={() => setCompleteVisitId(null)}
          visitId={completeVisitId}
          onCompleted={() => {
            setCompleteVisitId(null);
            fetchDoctorsAndQueue();
          }}
        />
      )}
    </div>
  );
};
