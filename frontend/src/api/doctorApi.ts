import { apiRequest } from './client';
import { Doctor, Department, Appointment, HospitalKPIs, AuditLog, NotificationItem } from '../types';

export const doctorApi = {
  listAll: (departmentId?: string) =>
    apiRequest<Doctor[]>(`/doctors${departmentId ? `?departmentId=${departmentId}` : ''}`),

  getById: (id: string) =>
    apiRequest<Doctor>(`/doctors/${id}`),

  listDepartments: () =>
    apiRequest<Department[]>('/doctors/departments'),
};

export const appointmentApi = {
  listAll: (filters: { date?: string; status?: string; doctorId?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.set('date', filters.date);
    if (filters.status) params.set('status', filters.status);
    if (filters.doctorId) params.set('doctorId', filters.doctorId);
    return apiRequest<Appointment[]>(`/appointments?${params.toString()}`);
  },

  create: (payload: any) =>
    apiRequest<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listByPatient: (patientId: string) =>
    apiRequest<Appointment[]>(`/appointments/patient/${patientId}`),

  listByDoctor: (doctorId: string, date?: string) =>
    apiRequest<Appointment[]>(`/appointments/doctor/${doctorId}${date ? `?date=${date}` : ''}`),

  cancel: (id: string) =>
    apiRequest<Appointment>(`/appointments/${id}/cancel`, {
      method: 'POST',
    }),
};

export const analyticsApi = {
  getKPIs: (range = 'today') =>
    apiRequest<HospitalKPIs>(`/analytics/kpis?range=${range}`),

  getCharts: (range = '7days') =>
    apiRequest<{
      dailyThroughput: any[];
      waitPerDoctor: any[];
      hourlyDistribution: any[];
      statusPie: any[];
    }>(`/analytics/charts?range=${range}`),
};

export const auditApi = {
  getLogs: (filter: any = {}) => {
    const params = new URLSearchParams();
    if (filter.action) params.set('action', filter.action);
    if (filter.actorRole) params.set('actorRole', filter.actorRole);
    if (filter.limit) params.set('limit', String(filter.limit));
    return apiRequest<{ logs: AuditLog[]; total: number }>(`/audit?${params.toString()}`);
  },
};

export const notificationApi = {
  getMy: () =>
    apiRequest<NotificationItem[]>('/notifications/my'),

  markRead: (id: string) =>
    apiRequest<NotificationItem>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllRead: () =>
    apiRequest<{ count: number }>('/notifications/read-all', {
      method: 'POST',
    }),
};
