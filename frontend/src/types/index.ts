export type UserRole = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  doctorId?: string;
  patientId?: string;
  patientCode?: string;
}

export type VisitStatus =
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'WAITING'
  | 'CALLED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'REASSIGNED'
  | 'TRANSFERRED';

export interface CalculatedQueueItem {
  visitId: string;
  visitCode: string;
  patientId: string;
  patientCode: string;
  patientName: string;
  tokenDisplay: string;
  tokenNumber: number;
  priorityLevel: number;
  status: VisitStatus;
  checkInTime: string;
  calledTime?: string | null;
  consultationStartTime?: string | null;
  position: number;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  estimatedConsultationTime: string;
  smartLeaveHomeTime: string;
  travelTimeMinutes: number;
  safetyBufferMinutes: number;
  notes?: string | null;
  complaint?: string | null;
}

export interface QueueStateSummary {
  queueId: string;
  doctorId: string;
  doctorName: string;
  doctorCode: string;
  doctorStatus: string;
  specialization: string;
  roomNumber: string;
  queueDate: string;
  status: string;
  currentNumber: number;
  totalTokens: number;
  currentDelayMinutes: number;
  delayReason?: string | null;
  waitingCount: number;
  inConsultationCount: number;
  completedCount: number;
  noShowCount: number;
  avgWaitTimeMinutes: number;
  avgConsultationDuration: number;
  items: CalculatedQueueItem[];
  currentlyCalling?: CalculatedQueueItem | null;
  inConsultation?: CalculatedQueueItem | null;
}

export interface PatientQueueView {
  visitId: string;
  visitCode: string;
  tokenDisplay: string;
  tokenNumber: number;
  status: VisitStatus;
  doctorName: string;
  specialization: string;
  roomNumber: string;
  departmentName: string;
  position: number;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  estimatedConsultationTime: string;
  smartLeaveHomeTime: string;
  travelTimeMinutes: number;
  safetyBufferMinutes: number;
  doctorStatus: string;
  currentDelayMinutes: number;
  delayReason?: string | null;
  checkInTime?: string | null;
  queueProgressPercent: number;
}

export interface Doctor {
  id: string;
  doctorCode: string;
  name: string;
  specialization: string;
  departmentId: string;
  avgConsultationDuration: number;
  status: string;
  currentDelayMinutes: number;
  delayReason?: string | null;
  roomNumber: string;
  department?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  location?: string;
}

export interface Patient {
  id: string;
  patientCode: string;
  name: string;
  email?: string;
  phone: string;
  gender: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  createdAt?: string;
  updatedAt?: string;
  travelPreference?: {
    originAddress?: string;
    travelTimeMinutes: number;
    safetyBufferMinutes: number;
    transportMode: string;
  };
}

export interface Appointment {
  id: string;
  appointmentCode: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  type: string;
  notes?: string;
  doctor?: Doctor;
  patient?: Patient;
  department?: Department;
}

export interface NotificationItem {
  id: string;
  recipientType: string;
  title: string;
  message: string;
  channel: string;
  isRead: boolean;
  eventType: string;
  metadata?: any;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  beforeState?: string;
  afterState?: string;
  reason?: string;
  metadata?: string;
}

export interface HospitalKPIs {
  patientsServedToday: number;
  currentWaitingPatients: number;
  totalVisitsToday: number;
  averageWaitingTimeMinutes: number;
  averageConsultationTimeMinutes: number;
  noShowRatePercent: number;
  cancellationRatePercent: number;
  activeQueuesCount: number;
  delayedDoctorsCount: number;
  delayedDoctorsList: Array<{
    id: string;
    name: string;
    delayMinutes: number;
    reason?: string;
    roomNumber: string;
  }>;
}
