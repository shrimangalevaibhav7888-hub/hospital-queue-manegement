import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { queueApi } from '../../api/queueApi';
import { CheckCircle2, FileText, Pill, Stethoscope } from 'lucide-react';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitId: string;
  onCompleted: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  visitId,
  onCompleted,
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await queueApi.completeConsultation(visitId, {
        diagnosis: diagnosis || 'Clinical evaluation completed',
        prescription: prescription || undefined,
        notes: notes || undefined,
      });
      onCompleted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete consultation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete & Prescribe — Clinical Summary" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" /> Primary Diagnosis / Assessment
          </label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Essential hypertension - stable on therapy"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-blue-600" /> Prescription & Treatment Regimen
          </label>
          <textarea
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            rows={2}
            placeholder="e.g. Tab Amlodipine 5mg OD, Tab Aspirin 75mg OD, review in 4 weeks"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-600" /> Clinical Notes & Advice
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Internal physician observations & lifestyle guidelines..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
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
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Finalize & Sign Off'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
