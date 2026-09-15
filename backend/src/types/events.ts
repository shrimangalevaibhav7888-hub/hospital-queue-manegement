import { QueueStateSummary, CalculatedQueueItem, PatientQueueView } from './queue';

export interface QueueUpdatedEventPayload {
  queueId: string;
  doctorId: string;
  queueDate: string;
  summary: QueueStateSummary;
  timestamp: string;
}

export interface PatientCalledEventPayload {
  queueId: string;
  doctorId: string;
  visitId: string;
  tokenDisplay: string;
  roomNumber: string;
  patientId: string;
  timestamp: string;
}

export interface DoctorDelayEventPayload {
  doctorId: string;
  doctorName: string;
  delayMinutes: number;
  reason: string;
  timestamp: string;
}

export interface NotificationEventPayload {
  id: string;
  patientId?: string | null;
  userId?: string | null;
  title: string;
  message: string;
  channel: string;
  eventType: string;
  timestamp: string;
}
