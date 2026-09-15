import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { queueApi } from '../../api/queueApi';
import { AlertCircle, Clock } from 'lucide-react';

interface ReportDelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  currentDelay: number;
  onDelayUpdated: () => void;
}

export const ReportDelayModal: React.FC<ReportDelayModalProps> = ({
  isOpen,
  onClose,
  doctorId,
  currentDelay,
  onDelayUpdated,
}) => {
  const [delayMinutes, setDelayMinutes] = useState(currentDelay || 15);
  const [reason, setReason] = useState('Emergency clinical case discussion');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetReasons = [
    'Emergency clinical case discussion',
    'Complex patient handover',
    'Emergency surgery / OR procedure',
    'Equipment calibration & sterile prep',
    'Unplanned diagnostic review',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await queueApi.reportDelay(doctorId, Number(delayMinutes), reason);
      onDelayUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to report delay');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDelay = async () => {
    setIsLoading(true);
    try {
      await queueApi.reportDelay(doctorId, 0, 'Delay resolved');
      onDelayUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Doctor Delay & Adjust Dynamic ETAs" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Reporting a delay will immediately update waiting patients' dynamic ETAs, adjust their Smart Leave-Home recommendations, and dispatch notifications.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Delay Duration (Minutes)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <span className="w-16 text-center px-2 py-1 bg-amber-50 rounded-lg border border-amber-200 text-sm font-bold text-amber-900 font-mono">
              +{delayMinutes}m
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Clinical Reason
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {presetReasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                  reason === r
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Specify reason..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          {currentDelay > 0 && (
            <button
              type="button"
              onClick={handleClearDelay}
              disabled={isLoading}
              className="text-xs text-teal-700 hover:text-teal-800 font-bold"
            >
              Clear Delay (0 min)
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-soft disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Broadcast Delay'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
