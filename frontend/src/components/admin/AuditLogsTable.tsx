import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { auditApi } from '../../api/doctorApi';
import { formatDateOnly, formatTimeOnly } from '../../utils/formatters';
import { ShieldCheck, Filter, Search, User, Clock, FileCode } from 'lucide-react';

export const AuditLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await auditApi.getLogs({
        action: actionFilter || undefined,
        actorRole: roleFilter || undefined,
        limit: 50,
      });
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, roleFilter]);

  const getActionBadgeColor = (action: string) => {
    if (action.includes('EMERGENCY')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('DELAY')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (action.includes('COMPLETED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('CALLED')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('REASSIGNED') || action.includes('MERGED')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="hospital-card overflow-hidden bg-white border border-slate-200 shadow-soft">
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Immutable Queue Audit Trail ({total})</h3>
            <p className="text-xs text-slate-500 font-medium">Every queue mutation, doctor delay, and emergency insertion recorded</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium"
          >
            <option value="">All Actions</option>
            <option value="PATIENT_CHECKED_IN">Patient Checked In</option>
            <option value="PATIENT_CALLED">Patient Called</option>
            <option value="PATIENT_COMPLETED">Consultation Completed</option>
            <option value="PATIENT_NO_SHOW">Patient No Show</option>
            <option value="EMERGENCY_INSERTED">Emergency Inserted</option>
            <option value="DOCTOR_DELAY_UPDATED">Doctor Delay Reported</option>
            <option value="DOCTOR_REASSIGNED">Doctor Reassigned</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="RECEPTIONIST">Receptionist</option>
            <option value="DOCTOR">Doctor</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4">Reason / Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                  <span className="font-mono text-slate-800 font-bold">{formatTimeOnly(log.timestamp)}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">{formatDateOnly(log.timestamp)}</span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{log.actorName}</div>
                  <span className="text-[10px] font-mono text-teal-700 uppercase font-semibold">{log.actorRole}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase ${getActionBadgeColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                  {log.entity}
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  {log.reason || (log.afterState ? <span className="font-mono text-[10px] text-slate-500 truncate max-w-xs block">{log.afterState}</span> : 'Standard procedure')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
