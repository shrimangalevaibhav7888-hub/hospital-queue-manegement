import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { patientApi } from '../../api/patientApi';
import { Car, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface TravelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  initialTravelMinutes: number;
  initialBufferMinutes: number;
  onSaved: () => void;
}

export const TravelSettingsModal: React.FC<TravelSettingsModalProps> = ({
  isOpen,
  onClose,
  patientId,
  initialTravelMinutes,
  initialBufferMinutes,
  onSaved,
}) => {
  const [travelMinutes, setTravelMinutes] = useState(initialTravelMinutes || 25);
  const [bufferMinutes, setBufferMinutes] = useState(initialBufferMinutes || 10);
  const [originAddress, setOriginAddress] = useState('');
  const [transportMode, setTransportMode] = useState<'DRIVING' | 'TRANSIT' | 'WALKING'>('DRIVING');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await patientApi.updateTravelSettings(patientId, {
        travelTimeMinutes: Number(travelMinutes),
        safetyBufferMinutes: Number(bufferMinutes),
        originAddress: originAddress || undefined,
        transportMode,
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Smart Arrival Departure Time" maxWidth="md">
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" /> Origin / Home Address
          </label>
          <input
            type="text"
            value={originAddress}
            onChange={(e) => setOriginAddress(e.target.value)}
            placeholder="e.g. 742 Evergreen Terrace, Springfield"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-amber-600" /> Travel Duration (mins)
            </label>
            <input
              type="number"
              min="1"
              max="300"
              value={travelMinutes}
              onChange={(e) => setTravelMinutes(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Safety Buffer (mins)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Transport Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['DRIVING', 'TRANSIT', 'WALKING'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTransportMode(mode)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                  transportMode === mode
                    ? 'bg-teal-600 border-teal-600 text-white shadow-soft'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {mode.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-soft transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
