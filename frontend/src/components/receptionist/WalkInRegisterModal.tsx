import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { queueApi } from '../../api/queueApi';
import { Doctor } from '../../types';
import { UserPlus, User, Phone, Stethoscope, Sparkles } from 'lucide-react';

interface WalkInRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onRegistered: () => void;
}

export const WalkInRegisterModal: React.FC<WalkInRegisterModalProps> = ({
  isOpen,
  onClose,
  doctors,
  onRegistered,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+1-555-0');
  const [gender, setGender] = useState('OTHER');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || '');
  const [priorityLevel, setPriorityLevel] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await queueApi.checkIn({
        name,
        phone,
        gender,
        doctorId: selectedDoctorId,
        priorityLevel: Number(priorityLevel),
        notes: notes || undefined,
      });
      onRegistered();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Walk-In Patient & Issue Token" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-600" /> Patient Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rachel Green"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600" /> Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Allocate Clinic & Doctor
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} — {doc.specialization} ({doc.roomNumber})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Priority Classification</label>
          <select
            value={priorityLevel}
            onChange={(e) => setPriorityLevel(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          >
            <option value={0}>Normal Walk-In (Standard FIFO Arrival)</option>
            <option value={1}>Priority (Elderly / Post-Op / Vulnerable)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">Notes / Chief Complaint</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Fever, routine dressing, chest evaluation..."
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
            <Sparkles className="w-4 h-4" />
            {isLoading ? 'Issuing Token...' : 'Generate Token & Check In'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
