import React from 'react';
import { HospitalKPIs } from '../../types';
import { Users, Clock, Stethoscope, AlertTriangle, UserX, Activity, CheckCircle2 } from 'lucide-react';

interface MetricCardsProps {
  kpis: HospitalKPIs | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ kpis }) => {
  if (!kpis) return null;

  const cards = [
    {
      title: 'Patients Served Today',
      value: kpis.patientsServedToday,
      subtitle: `${kpis.totalVisitsToday} total registered visits`,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Current Waiting in Line',
      value: kpis.currentWaitingPatients,
      subtitle: 'Across active doctor queues',
      icon: Users,
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Avg Waiting Time',
      value: `${kpis.averageWaitingTimeMinutes} min`,
      subtitle: 'Check-in to call timestamp',
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      title: 'Avg Consultation Time',
      value: `${kpis.averageConsultationTimeMinutes} min`,
      subtitle: 'Doctor clinical duration',
      icon: Stethoscope,
      color: 'text-purple-700',
      bg: 'bg-purple-50 border-purple-200',
    },
    {
      title: 'No-Show Rate',
      value: `${kpis.noShowRatePercent}%`,
      subtitle: 'Missed consultation calls',
      icon: UserX,
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
    },
    {
      title: 'Delayed Doctors',
      value: kpis.delayedDoctorsCount,
      subtitle: `${kpis.activeQueuesCount} active queues running`,
      icon: AlertTriangle,
      color: kpis.delayedDoctorsCount > 0 ? 'text-amber-700' : 'text-slate-500',
      bg: kpis.delayedDoctorsCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="hospital-card p-4 bg-white border border-slate-200/80 shadow-soft flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold truncate">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.bg} ${card.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">{card.value}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
