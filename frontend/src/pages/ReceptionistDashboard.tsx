import React, { useState, useEffect } from 'react';
import { Doctor } from '../types';
import { doctorApi } from '../api/doctorApi';
import { queueApi } from '../api/queueApi';
import { useSocket } from '../context/SocketContext';
import { MultiDoctorMatrix } from '../components/receptionist/MultiDoctorMatrix';
import { PatientSearch } from '../components/receptionist/PatientSearch';
import { WalkInRegisterModal } from '../components/receptionist/WalkInRegisterModal';
import { EmergencyInsertModal } from '../components/receptionist/EmergencyInsertModal';
import { ReassignDoctorModal } from '../components/receptionist/ReassignDoctorModal';
import { DoctorQueueTable } from '../components/doctor/DoctorQueueTable';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  UserPlus,
  ShieldAlert,
  ArrowRightLeft,
  Search,
  RefreshCw,
  LayoutGrid,
  Users,
  Calendar,
  X,
  Stethoscope,
  Building2,
} from 'lucide-react';

export const ReceptionistDashboard: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [overview, setOverview] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDoctorQueue, setSelectedDoctorQueue] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  const { socket, joinAdminRoom } = useSocket();

  const loadData = async () => {
    try {
      const [docs, ov] = await Promise.all([
        doctorApi.listAll(),
        queueApi.getPublicOverview(),
      ]);
      setDoctors(docs);
      setOverview(ov);

      if (selectedDoctorId) {
        const q = await queueApi.getDoctorQueue(selectedDoctorId);
        setSelectedDoctorQueue(q);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    joinAdminRoom();
  }, [joinAdminRoom]);

  useEffect(() => {
    if (!selectedDoctorId) {
      setSelectedDoctorQueue(null);
      return;
    }
    const fetchSelectedDocQueue = async () => {
      try {
        const q = await queueApi.getDoctorQueue(selectedDoctorId);
        setSelectedDoctorQueue(q);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSelectedDocQueue();
  }, [selectedDoctorId]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      loadData();
    };
    socket.on('queue.updated', handleUpdate);
    socket.on('doctor.status_changed', handleUpdate);
    return () => {
      socket.off('queue.updated', handleUpdate);
      socket.off('doctor.status_changed', handleUpdate);
    };
  }, [socket, selectedDoctorId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  const selectedDocObj = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Reception Action Header */}
      <div className="hospital-card p-6 sm:p-8 bg-white border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Front Desk & Triage
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Central Reception & Triage Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Walk-in registration, emergency priority triage, multi-clinic routing & doctor allocation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-soft"
            title="Refresh Clinics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Walk-In Registration</span>
          </button>

          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Insert Emergency</span>
          </button>

          <button
            onClick={() => setIsReassignModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Reassign / Transfer</span>
          </button>
        </div>
      </div>

      {/* Fast Patient Lookup Bar */}
      <PatientSearch
        onSelectPatient={(p) => {
          setIsWalkInModalOpen(true);
        }}
      />

      {/* Selected Doctor Live Queue Drilldown if active */}
      {selectedDoctorId && selectedDoctorQueue && (
        <div className="hospital-card p-6 bg-white border border-teal-200 border-l-4 border-l-teal-600 shadow-soft relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Managing Active Queue: {selectedDocObj?.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {selectedDocObj?.specialization} • {selectedDocObj?.roomNumber}
              </p>
            </div>
            <button
              onClick={() => setSelectedDoctorId(null)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <DoctorQueueTable items={selectedDoctorQueue.items || []} />
        </div>
      )}

      {/* Multi-Doctor Live Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-teal-600" />
            Live Hospital Clinics Matrix ({doctors.length} Active Doctors)
          </h2>
          <span className="text-xs text-slate-500 font-medium">Click any clinic card to inspect its queue</span>
        </div>

        <MultiDoctorMatrix
          doctors={doctors}
          overviewData={overview}
          onSelectDoctor={(docId) => setSelectedDoctorId(docId)}
        />
      </div>

      {/* Modals */}
      <WalkInRegisterModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        doctors={doctors}
        onRegistered={loadData}
      />

      <EmergencyInsertModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        doctors={doctors}
        onInserted={loadData}
      />

      <ReassignDoctorModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        doctors={doctors}
        onReassigned={loadData}
      />
    </div>
  );
};
