import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { doctorApi } from '../../api/doctorApi';
import { queueApi } from '../../api/queueApi';
import { Doctor } from '../../types';
import { UserCheck, Stethoscope } from 'lucide-react';

interface OnlineCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientCode: string;
  patientName: string;
  onCheckedIn: () => void;
}

export const OnlineCheckInModal: React.FC<OnlineCheckInModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientCode,
  patientName,
  onCheckedIn,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const loadDoctors = async () => {
      try {
        const docs = await doctorApi.listAll();
        setDoctors(docs);
        if (docs.length > 0) setSelectedDoctorId(docs[0].id);
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadDoctors();
  }, [isOpen]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await queueApi.checkIn({
        patientId,
        patientCode,
        name: patientName,
        doctorId: selectedDoctorId,
        notes: notes || undefined,
      });
      onCheckedIn();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Check-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Self Check-In & Get Live Token" maxWidth="md">
      <form onSubmit={handleCheckIn} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <p className="font-bold text-slate-900">Patient: {patientName}</p>
          <p className="text-slate-500 mt-0.5 font-mono">Patient Code: {patientCode}</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" /> Select Doctor / Clinic
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialization} - {doc.roomNumber})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Reason for Visit / Symptoms (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Brief description of symptoms..."
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
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-soft disabled:opacity-50 flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            {isLoading ? 'Checking in...' : 'Check In Now'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
