import { UserRole, VisitStatus, DoctorStatus, QueueStatus, PriorityLevel } from '../config/constants';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientEntity {
  id: string;
  patientCode: string;
  userId?: string | null;
  name: string;
  email?: string | null;
  phone: string;
  gender: string;
  dateOfBirth?: Date | null;
  address?: string | null;
  emergencyContact?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentEntity {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  location?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorEntity {
  id: string;
  doctorCode: string;
  userId: string;
  name: string;
  specialization: string;
  departmentId: string;
  avgConsultationDuration: number;
  status: DoctorStatus;
  currentDelayMinutes: number;
  delayReason?: string | null;
  roomNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueEntity {
  id: string;
  doctorId: string;
  queueDate: string; // YYYY-MM-DD
  status: QueueStatus;
  currentNumber: number;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitEntity {
  id: string;
  visitCode: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string | null;
  queueId: string;
  status: VisitStatus;
  priorityLevel: PriorityLevel;
  checkInTime?: Date | null;
  calledTime?: Date | null;
  consultationStartTime?: Date | null;
  consultationEndTime?: Date | null;
  reassignedFromDoctorId?: string | null;
  reassignedReason?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenEntity {
  id: string;
  tokenNumber: number;
  tokenDisplay: string;
  visitId: string;
  doctorId: string;
  queueDate: string;
  createdAt: Date;
}

export interface TravelPreferenceEntity {
  id: string;
  patientId: string;
  originAddress?: string | null;
  travelTimeMinutes: number;
  safetyBufferMinutes: number;
  transportMode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationEntity {
  id: string;
  visitId: string;
  doctorId: string;
  patientId: string;
  actualDurationMinutes: number;
  diagnosis?: string | null;
  prescription?: string | null;
  notes?: string | null;
  createdAt: Date;
}

export interface AuditLogEntity {
  id: string;
  timestamp: Date;
  actorId?: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  beforeState?: string | null;
  afterState?: string | null;
  reason?: string | null;
  metadata?: string | null;
}

export interface NotificationEntity {
  id: string;
  recipientType: 'PATIENT' | 'DOCTOR' | 'STAFF';
  patientId?: string | null;
  userId?: string | null;
  title: string;
  message: string;
  channel: string;
  isRead: boolean;
  eventType: string;
  metadata?: string | null;
  createdAt: Date;
}
