import { VisitStatus, PriorityLevel } from '../config/constants';

export interface CalculatedQueueItem {
  visitId: string;
  visitCode: string;
  patientId: string;
  patientCode: string;
  patientName: string;
  tokenDisplay: string;
  tokenNumber: number;
  priorityLevel: PriorityLevel;
  status: VisitStatus;
  checkInTime: Date;
  calledTime?: Date | null;
  consultationStartTime?: Date | null;
  position: number; // 1-based dynamic live position in waiting line
  patientsAhead: number; // number of waiting patients ahead
  estimatedWaitMinutes: number;
  estimatedConsultationTime: string; // ISO String
  smartLeaveHomeTime: string; // ISO String
  travelTimeMinutes: number;
  safetyBufferMinutes: number;
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

export interface PublicQueueItem {
  tokenDisplay: string;
  position: number;
  status: VisitStatus;
  roomNumber: string;
  doctorName: string;
  departmentName: string;
  estimatedWaitMinutes: number;
}
