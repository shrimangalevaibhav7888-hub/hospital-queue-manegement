export const USER_ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const VISIT_STATUS = {
  BOOKED: 'BOOKED',
  CHECKED_IN: 'CHECKED_IN',
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  IN_CONSULTATION: 'IN_CONSULTATION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  REASSIGNED: 'REASSIGNED',
  TRANSFERRED: 'TRANSFERRED',
} as const;

export type VisitStatus = (typeof VISIT_STATUS)[keyof typeof VISIT_STATUS];

export const DOCTOR_STATUS = {
  AVAILABLE: 'AVAILABLE',
  BUSY: 'BUSY',
  ON_BREAK: 'ON_BREAK',
  DELAYED: 'DELAYED',
  OFFLINE: 'OFFLINE',
} as const;

export type DoctorStatus = (typeof DOCTOR_STATUS)[keyof typeof DOCTOR_STATUS];

export const QUEUE_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
} as const;

export type QueueStatus = (typeof QUEUE_STATUS)[keyof typeof QUEUE_STATUS];

export const PRIORITY_LEVEL = {
  NORMAL: 0,
  PRIORITY: 1,
  EMERGENCY: 2,
} as const;

export type PriorityLevel = (typeof PRIORITY_LEVEL)[keyof typeof PRIORITY_LEVEL];

export const NOTIFICATION_CHANNELS = {
  IN_APP: 'IN_APP',
  SMS_MOCK: 'SMS_MOCK',
  PUSH_MOCK: 'PUSH_MOCK',
} as const;

export const SOCKET_EVENTS = {
  QUEUE_UPDATED: 'queue.updated',
  PATIENT_CALLED: 'queue.patient_called',
  PATIENT_COMPLETED: 'queue.patient_completed',
  PATIENT_NO_SHOW: 'queue.patient_no_show',
  PATIENT_REASSIGNED: 'queue.patient_reassigned',
  PRIORITY_INSERTED: 'queue.priority_inserted',
  DOCTOR_STATUS_CHANGED: 'doctor.status_changed',
  DOCTOR_DELAY_UPDATED: 'queue.delay_updated',
  NOTIFICATION_CREATED: 'notification.created',
} as const;
