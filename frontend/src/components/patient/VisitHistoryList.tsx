import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { formatDateOnly, formatTimeOnly } from '../../utils/formatters';
import { History, FileText, Stethoscope } from 'lucide-react';

interface VisitHistoryListProps {
  visits: any[];
}

export const VisitHistoryList: React.FC<VisitHistoryListProps> = ({ visits }) => {
  if (!visits || visits.length === 0) {
    return (
      <div className="hospital-card p-8 text-center text-slate-400 bg-white border border-slate-200 shadow-soft">
        <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
        <p className="text-xs">No previous visit records found.</p>
      </div>
    );
  }

  return (
    <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-4">
        <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Visit & Consultation History</h3>
          <p className="text-xs text-slate-500 font-medium">Chronological hospital records & past tokens</p>
        </div>
      </div>

      <div className="space-y-3">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 font-mono text-xs font-bold text-teal-800">
                  {visit.token?.tokenDisplay || `T-${visit.visitCode.slice(-4)}`}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    {visit.doctor?.name || 'Doctor Consultation'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {visit.doctor?.department?.name || 'General Clinic'} • {formatDateOnly(visit.createdAt)}
                  </p>
                </div>
              </div>
              <StatusBadge status={visit.status} size="sm" />
            </div>

            {visit.notes && (
              <p className="text-xs text-slate-600 mt-2.5 pl-2 border-l-2 border-teal-500 italic">
                "{visit.notes}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
