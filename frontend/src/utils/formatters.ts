import { format, parseISO, isValid } from 'date-fns';

export function formatTimeOnly(isoString?: string | null): string {
  if (!isoString) return '--:--';
  try {
    const date = typeof isoString === 'string' ? parseISO(isoString) : new Date(isoString);
    if (!isValid(date)) return '--:--';
    return format(date, 'hh:mm a');
  } catch {
    return '--:--';
  }
}

export function formatDateOnly(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const date = typeof isoString === 'string' ? parseISO(isoString) : new Date(isoString);
    if (!isValid(date)) return '';
    return format(date, 'MMM dd, yyyy');
  } catch {
    return '';
  }
}

export function formatMinutes(mins?: number): string {
  if (mins === undefined || mins === null) return '0 min';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining > 0 ? `${hours} hr ${remaining} min` : `${hours} hr`;
}

export function getStatusBadgeConfig(status: string) {
  switch (status) {
    case 'IN_CONSULTATION':
      return { label: 'In Consultation', color: 'bg-teal-50 text-teal-700 border-teal-200' };
    case 'CALLED':
      return { label: 'Called - Entry Ready', color: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' };
    case 'WAITING':
      return { label: 'Waiting in Queue', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'CHECKED_IN':
      return { label: 'Checked In', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'COMPLETED':
      return { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'NO_SHOW':
      return { label: 'No Show', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'CANCELLED':
      return { label: 'Cancelled', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    case 'DELAYED':
      return { label: 'Delayed', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'AVAILABLE':
      return { label: 'Available', color: 'bg-teal-50 text-teal-700 border-teal-200' };
    case 'BUSY':
      return { label: 'Busy', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'ON_BREAK':
      return { label: 'On Break', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'OFFLINE':
      return { label: 'Offline', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    default:
      return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}
