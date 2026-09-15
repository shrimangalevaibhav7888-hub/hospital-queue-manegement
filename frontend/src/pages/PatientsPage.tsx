import React, { useState, useEffect } from 'react';
import { patientApi } from '../api/patientApi';
import { doctorApi } from '../api/doctorApi';
import { Patient, Doctor } from '../types';
import { WalkInRegisterModal } from '../components/receptionist/WalkInRegisterModal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { formatDateOnly } from '../utils/formatters';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
  FileText,
  ShieldCheck,
  Activity,
  HeartPulse,
} from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<any | null>(null);

  const fetchPatients = async (query = '') => {
    setIsLoading(true);
    try {
      const data = await patientApi.search(query);
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    doctorApi.listAll().then(setDoctorsList).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(searchQuery.trim());
  };

  const handleViewPatientDetails = async (patientId: string) => {
    try {
      const data = await patientApi.getById(patientId);
      setSelectedPatientHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Master Patient Index (EMR)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Directory & Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Search permanent medical records, contact profiles, travel preferences & queue visit history
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchPatients(searchQuery)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition-colors shadow-soft"
            title="Refresh Directory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="hospital-card p-4 bg-white border border-slate-200 shadow-soft">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Code (e.g. PAT-100024), Name, Phone, or Email..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-soft"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                fetchPatients('');
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Patient Directory Grid / Table */}
      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : patients.length === 0 ? (
        <div className="hospital-card p-12 text-center text-slate-400 bg-white border border-slate-200 shadow-soft">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <h4 className="text-sm font-bold text-slate-700">No Patients Found</h4>
          <p className="text-xs text-slate-500 mt-1">Try a different search query or register a new patient.</p>
        </div>
      ) : (
        <div className="hospital-card overflow-hidden bg-white border border-slate-200 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3.5 px-4">Patient Code</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Gender</th>
                  <th className="py-3.5 px-4">Address / Origin</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 font-mono text-xs font-bold text-teal-800">
                        {p.patientCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.name}
                      {p.email && <div className="text-[11px] text-slate-400 font-normal">{p.email}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {p.phone}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase">
                        {p.gender || 'OTHER'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">
                      {p.address || 'Standard local area'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDateOnly(p.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewPatientDetails(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 text-xs font-bold transition-all shadow-soft"
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Detail / History Modal */}
      {selectedPatientHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-elevated p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Patient Medical Summary
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedPatientHistory.name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Code: {selectedPatientHistory.patientCode} • Phone: {selectedPatientHistory.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatientHistory(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Travel & Origin config */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-bold block">Smart Arrival Travel Time:</span>
                <span className="text-sm font-bold text-slate-800">
                  {selectedPatientHistory.travelPreference?.travelTimeMinutes || 25} mins
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Safety Buffer Margin:</span>
                <span className="text-sm font-bold text-slate-800">
                  {selectedPatientHistory.travelPreference?.safetyBufferMinutes || 10} mins
                </span>
              </div>
            </div>

            {/* Recent Visits */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Recent Consultations & Queue History
            </h4>
            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {selectedPatientHistory.recentVisits?.length > 0 ? (
                selectedPatientHistory.recentVisits.map((v: any) => (
                  <div key={v.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-teal-800">{v.visitCode}</span>
                      <p className="text-slate-500 mt-0.5">{formatDateOnly(v.createdAt)}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {v.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No recorded past visits for this patient.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      <WalkInRegisterModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        doctors={doctorsList}
        onRegistered={() => fetchPatients(searchQuery)}
      />
    </div>
  );
};
