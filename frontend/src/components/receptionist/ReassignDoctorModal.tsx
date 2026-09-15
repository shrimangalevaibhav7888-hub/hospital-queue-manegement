import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { queueApi } from '../../api/queueApi';
import { Doctor } from '../../types';
import { ArrowRightLeft, UserCheck, AlertTriangle } from 'lucide-react';

interface ReassignDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onReassigned: () => void;
}

export const ReassignDoctorModal: React.FC<ReassignDoctorModalProps> = ({
  isOpen,
  onClose,
  doctors,
  onReassigned,
}) => {
  const [mode, setMode] = useState<'entireQueue' | 'single'>('entireQueue');
  const [fromDoctorId, setFromDoctorId] = useState<string>(doctors[0]?.id || '');
  const [toDoctorId, setToDoctorId] = useState<string>(doctors[1]?.id || doctors[0]?.id || '');
  const [visitId, setVisitId] = useState<string>('');
  const [reason, setReason] = useState('Doctor called away for emergency surgery');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromDoctorId === toDoctorId && mode === 'entireQueue') {
      setError('Source and target doctors must be different');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'entireQueue') {
        await queueApi.reassignQueue(fromDoctorId, toDoctorId, reason);
      } else {
        await queueApi.reassignPatient(visitId, toDoctorId, reason);
      }
      onReassigned();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Reassignment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Doctor Reassignment & Queue Merge" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('entireQueue')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              mode === 'entireQueue'
                ? 'bg-teal-600 border-teal-600 text-white shadow-soft'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Transfer Entire Queue
          </button>
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              mode === 'single'
                ? 'bg-teal-600 border-teal-600 text-white shadow-soft'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Reassign Single Visit
          </button>
        </div>

        {mode === 'entireQueue' ? (
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Source Doctor (Unavailable)
              </label>
              <select
                value={fromDoctorId}
                onChange={(e) => setFromDoctorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Target Replacement Doctor
              </label>
              <select
                value={toDoctorId}
                onChange={(e) => setToDoctorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500"
              >
                {doctors
                  .filter((d) => d.id !== fromDoctorId)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Visit ID</label>
              <input
                type="text"
                value={visitId}
                onChange={(e) => setVisitId(e.target.value)}
                placeholder="Paste Visit ID or select from queue"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Target Doctor
              </label>
              <select
                value={toDoctorId}
                onChange={(e) => setToDoctorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Reason for Reassignment (Audit Logged)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-800 leading-relaxed font-medium">
          Fair queue engine preserves original check-in timestamps and emergency priorities in the recipient queue.
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-soft disabled:opacity-50 flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-4 h-4" />
            {isLoading ? 'Transferring...' : 'Execute Reassignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
