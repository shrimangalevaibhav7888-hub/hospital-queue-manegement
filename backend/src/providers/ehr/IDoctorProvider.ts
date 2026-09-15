import { DoctorWithDepartment } from '../../repositories/interfaces/IDoctorRepository';

export interface IDoctorProvider {
  getDoctorByCode(code: string): Promise<DoctorWithDepartment | null>;
  syncDoctorRoster(): Promise<DoctorWithDepartment[]>;
}

export interface IHospitalQueueProvider {
  broadcastToHospitalDisplay(displayUnitId: string, payload: any): Promise<boolean>;
  reportQueueMetricsToHIS(hospitalId: string, metrics: any): Promise<boolean>;
}
