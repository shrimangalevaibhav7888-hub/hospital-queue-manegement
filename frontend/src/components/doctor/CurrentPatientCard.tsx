import React, { useState, useEffect } from 'react';
import { CalculatedQueueItem } from '../../types';
import { formatTimeOnly } from '../../utils/formatters';
import {
  Stethoscope,
  CheckCircle2,
  UserX,
  Play,
  Clock,
  AlertTriangle,
  ArrowRight,
  User,
  Activity,
  FileText,
} from 'lucide-react';

interface CurrentPatientCardProps {
  calledPatient?: CalculatedQueueItem | null;
  activeConsultation?: CalculatedQueueItem | null;
  onStartConsultation: (visitId: string) => void;
  onOpenCompleteModal: (visitId: string) => void;
  onMarkNoShow: (visitId: string) => void;
}

export const CurrentPatientCard: React.FC<CurrentPatientCardProps> = ({
  calledPatient,
  activeConsultation,
  onStartConsultation,
  onOpenCompleteModal,
  onMarkNoShow,
}) => {
  const current = activeConsultation || calledPatient;
  const isInConsultation = !!activeConsultation;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isInConsultation || !activeConsultation?.consultationStartTime) {
      setElapsedSeconds(0);
      return;
    }

    const startMs = new Date(activeConsultation.consultationStartTime).getTime();
    const updateElapsed = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isInConsultation, activeConsultation]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!current) {
    return (
      <div className="hospital-card p-6 sm:p-8 text-center bg-white border border-slate-200 shadow-soft">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 border border-teal-100">
          <Stethoscope className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Patient Currently in Consultation</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Click <strong className="text-teal-700">"CALL NEXT PATIENT"</strong> in the top header to invite the next token in queue into your room.
        </p>
      </div>
    );
  }

  const isEmergency = current.priorityLevel === 2;
  const isPriority = current.priorityLevel === 1;

  return (
    <div
      className={`p-6 sm:p-7 transition-all relative overflow-hidden ${
        isInConsultation
          ? 'hospital-card-active'
          : isEmergency
          ? 'hospital-card-rose animate-pulse-subtle'
          : 'hospital-card-amber animate-pulse-subtle'
      }`}
    >
      {/* Top Banner Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isInConsultation ? 'bg-teal-400' : 'bg-amber-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isInConsultation ? 'bg-teal-600' : 'bg-amber-500'
              }`}
            ></span>
          </span>
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            ● LIVE
          </span>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            {isInConsultation ? 'Active Consultation in Room' : 'Patient Called — Awaiting Entry'}
          </h3>
        </div>

        {/* Stopwatch Timer */}
        {isInConsultation ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-mono text-xs font-bold shadow-soft">
            <Clock className="w-4 h-4 text-teal-600 animate-spin" />
            <span>Consultation Time: {formatTimer(elapsedSeconds)}</span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
            Calling Token...
          </span>
        )}
      </div>

      {/* Main Patient Card Details */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Token + Patient Avatar & Identity (5 cols) */}
        <div className="lg:col-span-5 flex items-start sm:items-center gap-4">
          <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-50 to-slate-50 border-2 border-teal-300 font-mono shadow-soft shrink-0">
            <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">Token</span>
            <span className="text-2xl font-black text-slate-900">{current.tokenDisplay}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-bold text-slate-900 leading-tight">{current.patientName}</h4>
              {isEmergency && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" /> Emergency
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
              <span className="font-mono text-slate-700 font-semibold">{current.patientCode}</span>
              <span>•</span>
              <span>Checked In {formatTimeOnly(current.checkInTime)}</span>
            </div>
          </div>
        </div>

        {/* Clinical Meta & Complaints (4 cols) */}
        <div className="lg:col-span-4 bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-500">Priority Level:</span>
            <span
              className={`font-semibold ${
                isEmergency
                  ? 'text-rose-700 font-bold'
                  : isPriority
                  ? 'text-amber-700'
                  : 'text-slate-700'
              }`}
            >
              {isEmergency ? '🚨 Emergency (High Priority)' : isPriority ? '⚡ Priority' : 'Normal'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-500">Visit Reference:</span>
            <span className="font-mono font-semibold text-slate-800">{current.visitCode}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-500">Complaint / Notes:</span>
            <span className="font-medium text-slate-800 truncate max-w-[180px]">
              {current.notes || (isEmergency ? 'Urgent triage review' : 'Routine clinical consultation')}
            </span>
          </div>
        </div>

        {/* Action Buttons (3 cols) */}
        <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col justify-end gap-2.5">
          {!isInConsultation ? (
            <>
              <button
                onClick={() => onStartConsultation(current.visitId)}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-soft transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Consultation</span>
              </button>
              <button
                onClick={() => onMarkNoShow(current.visitId)}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Mark No Show</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => onOpenCompleteModal(current.visitId)}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete & Prescribe</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
