import { apiRequest } from './client';
import { QueueStateSummary, PatientQueueView } from '../types';

export const queueApi = {
  getDoctorQueue: (doctorId: string, date?: string) =>
    apiRequest<QueueStateSummary>(`/queues/doctor/${doctorId}${date ? `?date=${date}` : ''}`),

  getPatientQueueView: (visitId: string) =>
    apiRequest<PatientQueueView>(`/queues/patient-view/${visitId}`),

  getActiveVisitByPatient: (patientId: string) =>
    apiRequest<PatientQueueView | null>(`/queues/patient-active/${patientId}`),

  getPublicOverview: () =>
    apiRequest<any[]>('/queues/public-overview'),

  checkIn: (payload: any) =>
    apiRequest<{ visit: any; summary: QueueStateSummary }>('/queues/check-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  callNext: (doctorId: string) =>
    apiRequest<{ calledVisit: any; summary: QueueStateSummary }>(`/queues/doctor/${doctorId}/call-next`, {
      method: 'POST',
    }),

  startConsultation: (visitId: string) =>
    apiRequest<QueueStateSummary>(`/queues/visit/${visitId}/start`, {
      method: 'POST',
    }),

  completeConsultation: (visitId: string, payload: any) =>
    apiRequest<{ visit: any; summary: QueueStateSummary }>(`/queues/visit/${visitId}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  markNoShow: (visitId: string, reason?: string) =>
    apiRequest<QueueStateSummary>(`/queues/visit/${visitId}/no-show`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  cancelVisit: (visitId: string, reason: string) =>
    apiRequest<QueueStateSummary>(`/queues/visit/${visitId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  reportDelay: (doctorId: string, delayMinutes: number, reason: string) =>
    apiRequest<QueueStateSummary>('/queues/doctor/delay', {
      method: 'POST',
      body: JSON.stringify({ doctorId, delayMinutes, reason }),
    }),

  pauseQueue: (doctorId: string, reason: string) =>
    apiRequest<QueueStateSummary>('/queues/doctor/pause', {
      method: 'POST',
      body: JSON.stringify({ doctorId, reason }),
    }),

  resumeQueue: (doctorId: string) =>
    apiRequest<QueueStateSummary>(`/queues/doctor/${doctorId}/resume`, {
      method: 'POST',
    }),

  previewEmergencyImpact: (doctorId: string) =>
    apiRequest<{ currentWaitingCount: number; estimatedAdditionalDelayMinutes: number; impactedPatientsCount: number }>(
      `/queues/emergency-preview/${doctorId}`
    ),

  insertEmergency: (payload: any) =>
    apiRequest<{ visit: any; summary: QueueStateSummary; impactedPatientsCount: number }>(
      '/queues/emergency-insert',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  reassignPatient: (visitId: string, targetDoctorId: string, reason: string) =>
    apiRequest<any>('/queues/reassign-patient', {
      method: 'POST',
      body: JSON.stringify({ visitId, targetDoctorId, reason }),
    }),

  reassignQueue: (fromDoctorId: string, toDoctorId: string, reason: string) =>
    apiRequest<any>('/queues/reassign-queue', {
      method: 'POST',
      body: JSON.stringify({ fromDoctorId, toDoctorId, reason }),
    }),
};
