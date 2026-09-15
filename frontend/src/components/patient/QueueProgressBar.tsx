import React from 'react';
import { Check, Clock, UserCheck, Bell, Stethoscope, CheckCircle2 } from 'lucide-react';
import { VisitStatus } from '../../types';

interface QueueProgressBarProps {
  status: VisitStatus;
}

const STEPS = [
  { key: 'BOOKED', label: 'Booked', icon: Clock },
  { key: 'CHECKED_IN', label: 'Checked In', icon: UserCheck },
  { key: 'WAITING', label: 'In Queue', icon: Bell },
  { key: 'CALLED', label: 'Called', icon: Bell },
  { key: 'IN_CONSULTATION', label: 'Consulting', icon: Stethoscope },
  { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
];

export const QueueProgressBar: React.FC<QueueProgressBarProps> = ({ status }) => {
  const getStepIndex = (st: VisitStatus) => {
    switch (st) {
      case 'BOOKED':
        return 0;
      case 'CHECKED_IN':
        return 1;
      case 'WAITING':
        return 2;
      case 'CALLED':
        return 3;
      case 'IN_CONSULTATION':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 2;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Track Line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full z-0">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-soft ${
                  isDone
                    ? 'bg-teal-600 text-white shadow-teal-600/20'
                    : isCurrent
                    ? 'bg-white border-2 border-teal-600 text-teal-700 ring-4 ring-teal-100 animate-pulse'
                    : 'bg-slate-50 border border-slate-200 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-[11px] mt-2 font-semibold transition-colors text-center hidden sm:block ${
                  isCurrent ? 'text-teal-700 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
