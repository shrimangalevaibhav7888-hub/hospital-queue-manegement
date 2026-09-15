import { apiRequest } from './client';
import { Patient } from '../types';

export const patientApi = {
  search: (query?: string) =>
    apiRequest<Patient[]>(`/patients/search${query ? `?q=${encodeURIComponent(query)}` : ''}`),

  getById: (id: string) =>
    apiRequest<Patient & { travelPreference?: any; recentVisits?: any[] }>(`/patients/${id}`),

  updateTravelSettings: (patientId: string, payload: any) =>
    apiRequest<any>(`/patients/${patientId}/travel-settings`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getVisitHistory: (patientId: string) =>
    apiRequest<any[]>(`/patients/${patientId}/visits`),
};
