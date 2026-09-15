import React from 'react';
import { PatientQueueView } from '../../types';
import { formatTimeOnly } from '../../utils/formatters';
import { Navigation, Clock, ShieldCheck, Car, AlertTriangle, CheckCircle } from 'lucide-react';

interface SmartArrivalCardProps {
  view: PatientQueueView;
  onEditSettings: () => void;
}

export const SmartArrivalCard: React.FC<SmartArrivalCardProps> = ({ view, onEditSettings }) => {
  const travelMins = view.travelTimeMinutes;
  const bufferMins = view.safetyBufferMinutes;

  return (
    <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Smart Arrival Departure Advisor</h3>
            <p className="text-xs text-slate-500 font-medium">Calculated dynamic departure recommendations</p>
          </div>
        </div>
        <button
          onClick={onEditSettings}
          className="text-xs text-teal-700 hover:text-teal-800 font-bold transition-colors"
        >
          Edit Travel Config
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Estimated Consultation */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Estimated Consultation</span>
          </div>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatTimeOnly(view.estimatedConsultationTime)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Based on active doctor pace</p>
        </div>

        {/* Travel Time */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
            <Car className="w-4 h-4 text-amber-600" />
            <span>Travel Duration</span>
          </div>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{travelMins} mins</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Home to clinic route</p>
        </div>

        {/* Safety Buffer */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Safety Margin Buffer</span>
          </div>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{bufferMins} mins</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Parking & registration window</p>
        </div>
      </div>

      {/* Hero Recommendation Pill */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50/50 border border-teal-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-soft text-lg">
            🏠
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-teal-800 font-bold block">
              Recommended Departure
            </span>
            <p className="text-base font-bold text-slate-900">
              Leave home by <span className="text-teal-800 font-mono text-lg font-black">{formatTimeOnly(view.smartLeaveHomeTime)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-teal-800 text-xs font-bold border border-teal-200 shadow-soft">
          <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
          <span>Real-time dynamically synced</span>
        </div>
      </div>
    </div>
  );
};
