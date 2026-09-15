import { PatientEntity } from '../../types/domain';

export interface ExternalPatientRecord {
  externalId: string;
  nationalHealthId?: string;
  fullName: string;
  phone: string;
  email?: string;
  gender: string;
  birthDate?: string;
  address?: string;
}

/**
 * Interface for EHR / HIS / FHIR Patient identity synchronization
 */
export interface IPatientIdentityProvider {
  getPatientById(patientId: string): Promise<PatientEntity | null>;
  searchExternalPatients(query: string): Promise<ExternalPatientRecord[]>;
  syncPatientFromEHR(externalId: string): Promise<PatientEntity>;
}
