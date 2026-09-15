import React from 'react';
import { Doctor } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { MapPin, Users, AlertCircle, Clock, ChevronRight, Stethoscope } from 'lucide-react';

interface MultiDoctorMatrixProps {
  doctors: Doctor[];
  overviewData: any[];
  onSelectDoctor: (doctorId: string) => void;
}

export const MultiDoctorMatrix: React.FC<MultiDoctorMatrixProps> = ({
  doctors,
  overviewData,
  onSelectDoctor,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {doctors.map((doc) => {
        const queueStats = overviewData?.find((d) => d.doctorId === doc.id);
        const waitingCount = queueStats?.waitingCount ?? 0;
        const currentToken = queueStats?.currentCallingToken || queueStats?.inConsultationToken || '--';
        const delay = doc.currentDelayMinutes || queueStats?.currentDelayMinutes || 0;

        return (
          <div
            key={doc.id}
            onClick={() => onSelectDoctor(doc.id)}
            className="hospital-card p-5 bg-white border border-slate-200 hover:border-teal-300 hover:shadow-card transition-all cursor-pointer relative overflow-hidden group shadow-soft"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors text-sm flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  {doc.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{doc.specialization}</p>
                <p className="text-[11px] text-teal-700 font-bold flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-teal-600" />
                  {doc.roomNumber}
                </p>
              </div>
              <StatusBadge status={doc.status} size="sm" />
            </div>

            {/* Live Counts */}
            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Serving Now
                </span>
                <p className="text-lg font-black text-teal-800 font-mono mt-0.5">
                  {currentToken}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-blue-600" /> Waiting
                </span>
                <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  {waitingCount}
                </p>
              </div>
            </div>

            {/* Delay alert pill if delayed */}
            {delay > 0 && (
              <div className="mt-2.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Running delay: +{delay} mins</span>
              </div>
            )}

            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-bold">
              <span>Manage Clinic Queue</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
