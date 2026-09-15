import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentApi, doctorApi } from '../api/doctorApi';
import { Appointment, Doctor, Department } from '../types';
import { BookAppointmentModal } from '../components/patient/BookAppointmentModal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatTimeOnly, formatDateOnly } from '../utils/formatters';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Plus,
  RefreshCw,
  Filter,
  CheckCircle2,
  XCircle,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      if (user?.role === 'PATIENT' && user.patientId) {
        const data = await appointmentApi.listByPatient(user.patientId);
        setAppointments(data);
      } else {
        const data = await appointmentApi.listAll({
          status: statusFilter || undefined,
          doctorId: selectedDoctorFilter || undefined,
          date: selectedDate || undefined,
        });
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    doctorApi.listAll().then(setDoctors).catch(() => {});
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, selectedDoctorFilter, selectedDate, user]);

  const handleCancelAppointment = async (id: string) => {
    if (window.confirm('Cancel this scheduled hospital appointment?')) {
      try {
        await appointmentApi.cancel(id);
        fetchAppointments();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Outpatient Scheduling Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hospital Appointments & Booking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Schedule future OPD consultations, review booking rosters & manage clinic slots
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAppointments}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition-colors shadow-soft"
            title="Refresh Appointments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter Controls (for staff/doctor/admin) */}
      {user?.role !== 'PATIENT' && (
        <div className="hospital-card p-4 bg-white border border-slate-200 shadow-soft flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-4 h-4 text-teal-600" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="BOOKED">Booked / Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={selectedDoctorFilter}
            onChange={(e) => setSelectedDoctorFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
          >
            <option value="">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialization})
              </option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
          />

          {(statusFilter || selectedDoctorFilter || selectedDate) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setSelectedDoctorFilter('');
                setSelectedDate('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Appointments List */}
      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : appointments.length === 0 ? (
        <div className="hospital-card p-12 text-center text-slate-400 bg-white border border-slate-200 shadow-soft">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <h4 className="text-sm font-bold text-slate-700">No Appointments Found</h4>
          <p className="text-xs text-slate-500 mt-1">Book a new appointment or adjust your search filters.</p>
        </div>
      ) : (
        <div className="hospital-card overflow-hidden bg-white border border-slate-200 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Doctor & Specialty</th>
                  <th className="py-3.5 px-4">Scheduled Date</th>
                  <th className="py-3.5 px-4">Time Slot</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 font-mono text-xs font-bold text-teal-800">
                        {apt.appointmentCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {apt.patient?.name || user?.name}
                      {apt.patient?.patientCode && (
                        <div className="text-[11px] text-slate-400 font-mono">{apt.patient.patientCode}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                        {apt.doctor?.name || 'Assigned Physician'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {apt.doctor?.specialization || apt.department?.name || 'Outpatient'} • {apt.doctor?.roomNumber || 'OPD Room'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">
                      {apt.scheduledDate}
                    </td>
                    <td className="py-3.5 px-4 text-teal-700 font-bold font-mono">
                      {apt.scheduledTime}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                        {apt.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={apt.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {apt.status === 'BOOKED' && (
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-xs font-bold transition-all shadow-soft"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        patientId={user?.patientId || user?.id || ''}
        onBooked={fetchAppointments}
      />
    </div>
  );
};
