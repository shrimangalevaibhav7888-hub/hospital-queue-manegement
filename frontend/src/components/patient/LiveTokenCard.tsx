import React from 'react';
import { PatientQueueView } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatTimeOnly, formatMinutes } from '../../utils/formatters';
import { Clock, Car, ShieldAlert, User, MapPin, AlertCircle, Sparkles, Settings } from 'lucide-react';

interface LiveTokenCardProps {
  view: PatientQueueView;
  onOpenTravelSettings: () => void;
  onCancelVisit: () => void;
}

export const LiveTokenCard: React.FC<LiveTokenCardProps> = ({
  view,
  onOpenTravelSettings,
  onCancelVisit,
}) => {
  const isCalled = view.status === 'CALLED';
  const isInConsultation = view.status === 'IN_CONSULTATION';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 sm:p-7 transition-all border shadow-soft ${
        isCalled
          ? 'bg-amber-50/70 border-amber-300 border-l-4 border-l-amber-500 animate-pulse-subtle'
          : isInConsultation
          ? 'bg-white border-teal-200 border-l-4 border-l-teal-600'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{view.doctorName}</h2>
              {view.currentDelayMinutes > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> +{view.currentDelayMinutes}m Delay
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
              <span>{view.specialization}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-teal-700 font-bold">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                {view.roomNumber}
              </span>
            </p>
          </div>
        </div>
        <StatusBadge status={view.status} size="lg" />
      </div>

      {/* Called Alert Callout */}
      {isCalled && (
        <div className="mt-5 p-4 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 flex items-center gap-3 shadow-soft">
          <Sparkles className="w-6 h-6 text-amber-600 shrink-0 animate-bounce" />
          <div>
            <p className="text-sm font-bold">You have been called!</p>
            <p className="text-xs text-amber-800 mt-0.5">
              Please proceed immediately to <strong>{view.roomNumber}</strong> for consultation with {view.doctorName}.
            </p>
          </div>
        </div>
      )}

      {/* Hero Token Metric Grid */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Token Box */}
        <div className="col-span-2 sm:col-span-1 rounded-xl bg-gradient-to-br from-teal-50 to-white border-2 border-teal-300 p-4 text-center flex flex-col justify-center items-center shadow-soft">
          <span className="text-[10px] uppercase tracking-wider text-teal-700 font-bold">Your Live Token</span>
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 my-1 font-mono">
            {view.tokenDisplay}
          </span>
          <span className="text-[11px] text-slate-500 font-mono font-medium">Ref: {view.visitCode}</span>
        </div>

        {/* Position in Queue */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 flex flex-col justify-center shadow-soft">
          <span className="text-xs text-slate-500 font-bold">Queue Position</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {view.position > 0 ? `#${view.position}` : isCalled || isInConsultation ? 'Now' : '--'}
            </span>
            {view.patientsAhead > 0 && (
              <span className="text-xs text-slate-500 font-semibold">({view.patientsAhead} ahead)</span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {view.patientsAhead === 0 ? 'Next patient in line' : `${view.patientsAhead} patient(s) waiting ahead`}
          </span>
        </div>

        {/* Estimated Wait */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 flex flex-col justify-center shadow-soft">
          <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Estimated Wait
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono">
            {isCalled || isInConsultation ? '0 min' : formatMinutes(view.estimatedWaitMinutes)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Expected: {formatTimeOnly(view.estimatedConsultationTime)}
          </span>
        </div>

        {/* Smart Leave Home Time */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 flex flex-col justify-center shadow-soft">
          <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-emerald-600" /> Leave Home By
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 font-mono">
            {formatTimeOnly(view.smartLeaveHomeTime)}
          </span>
          <button
            onClick={onOpenTravelSettings}
            className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold mt-0.5 text-left flex items-center gap-1 transition-colors"
          >
            Config: {view.travelTimeMinutes}m travel + {view.safetyBufferMinutes}m buffer ⚙️
          </button>
        </div>
      </div>

      {/* Delay / Reason Banner if active */}
      {view.delayReason && (
        <div className="mt-4 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Doctor delay notice: {view.delayReason}</span>
        </div>
      )}

      {/* Actions footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-medium">
          Check-in time: {view.checkInTime ? formatTimeOnly(view.checkInTime) : 'Just now'}
        </div>
        {view.status === 'WAITING' && (
          <button
            onClick={onCancelVisit}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold transition-colors"
          >
            Cancel Queue Visit
          </button>
        )}
      </div>
    </div>
  );
};
