import React from 'react';
import { CalculatedQueueItem } from '../../types';
import { formatTimeOnly, formatMinutes } from '../../utils/formatters';
import { AlertTriangle, Clock, PhoneCall, RefreshCw, ArrowRight } from 'lucide-react';

interface DoctorQueueTableProps {
  items: CalculatedQueueItem[];
  onCallPatient?: (visitId: string) => void;
  lastUpdated?: string;
  onRefresh?: () => void;
}

export const DoctorQueueTable: React.FC<DoctorQueueTableProps> = ({
  items,
  onCallPatient,
  lastUpdated,
  onRefresh,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="hospital-card p-12 text-center text-slate-400 bg-white border border-slate-200 shadow-soft">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-700">Waiting Line is Clear</h4>
        <p className="text-xs text-slate-500 mt-1">
          No patients are currently waiting in this clinic's queue.
        </p>
      </div>
    );
  }

  return (
    <div className="hospital-card overflow-hidden bg-white border border-slate-200 shadow-soft">
      {/* Table Header Bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Live Waiting Line ({items.length})
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ordered deterministically by Emergency & Priority levels, then check-in time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[11px]">Auto Refresh</span>
            {lastUpdated && <span className="text-slate-400 text-[10px]">• {lastUpdated}</span>}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Refresh queue line"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <th className="py-3 px-4 text-center w-12">#</th>
              <th className="py-3 px-4">TOKEN</th>
              <th className="py-3 px-4">PATIENT NAME</th>
              <th className="py-3 px-4">PRIORITY</th>
              <th className="py-3 px-4">CHECK-IN</th>
              <th className="py-3 px-4">EST. WAIT</th>
              <th className="py-3 px-4">EXPECTED CALL</th>
              <th className="py-3 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {items.map((item, idx) => {
              const isEmergency = item.priorityLevel === 2;
              const isPriority = item.priorityLevel === 1;

              return (
                <tr
                  key={item.visitId}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isEmergency
                      ? 'bg-rose-50/40'
                      : isPriority
                      ? 'bg-amber-50/30'
                      : idx % 2 === 1
                      ? 'bg-slate-50/20'
                      : ''
                  }`}
                >
                  {/* Position number */}
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500 font-mono">
                    #{item.position || idx + 1}
                  </td>

                  {/* Token Display */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 font-mono font-bold text-teal-800 shadow-soft">
                      {item.tokenDisplay}
                    </span>
                  </td>

                  {/* Patient Name & Code */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.patientName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.patientCode}</div>
                  </td>

                  {/* Priority Badge */}
                  <td className="py-3.5 px-4">
                    {isEmergency ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px] uppercase inline-flex items-center gap-1 shadow-soft">
                        <AlertTriangle className="w-3 h-3" /> Emergency
                      </span>
                    ) : isPriority ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-[10px] uppercase inline-flex items-center gap-1">
                        ⚡ Priority
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-medium">
                        Normal
                      </span>
                    )}
                  </td>

                  {/* Check-In Time */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {formatTimeOnly(item.checkInTime)}
                  </td>

                  {/* Estimated Wait */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {formatMinutes(item.estimatedWaitMinutes)}
                  </td>

                  {/* Expected Call Time */}
                  <td className="py-3.5 px-4 font-semibold text-teal-700">
                    {formatTimeOnly(item.estimatedConsultationTime)}
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-right">
                    {onCallPatient ? (
                      <button
                        onClick={() => onCallPatient(item.visitId)}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 hover:border-teal-600 text-xs font-semibold transition-all shadow-soft inline-flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">In Queue</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
