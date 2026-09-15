import { FullAppointmentDetails } from '../../repositories/interfaces/IAppointmentRepository';

export interface ExternalAppointmentPayload {
  externalScheduleId: string;
  patientExternalId: string;
  doctorCode: string;
  departmentCode: string;
  appointmentDateTime: string;
  type: string;
}

/**
 * Interface for synchronization with external scheduling / EHR calendar systems
 */
export interface IAppointmentProvider {
  syncExternalAppointment(data: ExternalAppointmentPayload): Promise<FullAppointmentDetails>;
  notifyEHRAppointmentStatus(appointmentId: string, status: string): Promise<boolean>;
}
