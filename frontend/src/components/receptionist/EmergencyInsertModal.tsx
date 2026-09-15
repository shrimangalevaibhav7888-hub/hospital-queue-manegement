import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { queueApi } from '../../api/queueApi';
import { Doctor } from '../../types';
import { AlertTriangle, User, Phone, ShieldAlert, Sparkles } from 'lucide-react';

interface EmergencyInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onInserted: () => void;
}

export const EmergencyInsertModal: React.FC<EmergencyInsertModalProps> = ({
  isOpen,
  onClose,
  doctors,
  onInserted,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+1-555-9110');
  const [gender, setGender] = useState('OTHER');
  const [reason, setReason] = useState('Acute cardiovascular distress / emergency triage');
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<{
    currentWaitingCount: number;
    estimatedAdditionalDelayMinutes: number;
    impactedPatientsCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  useEffect(() => {
    if (!isOpen || !selectedDoctorId) return;
    const fetchPreview = async () => {
      try {
        const data = await queueApi.previewEmergencyImpact(selectedDoctorId);
        setPreview(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPreview();
  }, [isOpen, selectedDoctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await queueApi.insertEmergency({
        doctorId: selectedDoctorId,
        name,
        phone,
        gender,
        priorityLevel: 2, // Emergency
        reason,
        notes: notes || undefined,
      });
      onInserted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Emergency insertion failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Emergency Patient Priority Fast-Track" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Dynamic Impact Calculation Preview Alert */}
        {preview && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-700 mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Live Queue Impact Preview
            </div>
            <p className="text-xs leading-relaxed">
              Inserting this emergency patient will place them at <strong className="text-rose-900 font-bold">Position #1</strong> in the live queue.{' '}
              <strong className="text-rose-950">{preview.impactedPatientsCount} waiting patient(s)</strong> will be shifted back, adding approx{' '}
              <strong className="text-rose-950 font-bold">+{preview.estimatedAdditionalDelayMinutes} minutes</strong> to their dynamic ETAs.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Target Resuscitation / OPD Room
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} — {doc.specialization} ({doc.roomNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-600" /> Patient Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Victor Vance"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-600" /> Contact Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Clinical Triage Diagnosis / Emergency Reason
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="e.g. Acute severe trauma, dyspnea, critical chest pain"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-soft disabled:opacity-50 flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            {isLoading ? 'Inserting...' : 'Confirm Emergency Fast-Track'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
