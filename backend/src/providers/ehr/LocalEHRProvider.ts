import { IPatientIdentityProvider, ExternalPatientRecord } from './IPatientIdentityProvider';
import { IAppointmentProvider, ExternalAppointmentPayload } from './IAppointmentProvider';
import { IDoctorProvider, IHospitalQueueProvider } from './IDoctorProvider';
import { IPatientRepository } from '../../repositories/interfaces/IPatientRepository';
import { IDoctorRepository, DoctorWithDepartment } from '../../repositories/interfaces/IDoctorRepository';
import { IAppointmentRepository, FullAppointmentDetails } from '../../repositories/interfaces/IAppointmentRepository';
import { PatientEntity } from '../../types/domain';
import { logger } from '../../utils/logger';

export class LocalEHRProvider implements IPatientIdentityProvider, IAppointmentProvider, IDoctorProvider, IHospitalQueueProvider {
  constructor(
    private patientRepo: IPatientRepository,
    private doctorRepo: IDoctorRepository,
    private appointmentRepo: IAppointmentRepository
  ) {}

  async getPatientById(patientId: string): Promise<PatientEntity | null> {
    return this.patientRepo.findById(patientId);
  }

  async searchExternalPatients(query: string): Promise<ExternalPatientRecord[]> {
    const local = await this.patientRepo.search(query);
    return local.map((p) => ({
      externalId: p.patientCode,
      nationalHealthId: `NHI-${p.patientCode}`,
      fullName: p.name,
      phone: p.phone,
      email: p.email || undefined,
      gender: p.gender,
      birthDate: p.dateOfBirth?.toISOString(),
      address: p.address || undefined,
    }));
  }

  async syncPatientFromEHR(externalId: string): Promise<PatientEntity> {
    const existing = await this.patientRepo.findByPatientCode(externalId);
    if (existing) return existing;

    return this.patientRepo.create(
      {
        name: `EHR Patient (${externalId})`,
        phone: '+1-555-000-0000',
        gender: 'OTHER',
      },
      externalId
    );
  }

  async syncExternalAppointment(data: ExternalAppointmentPayload): Promise<FullAppointmentDetails> {
    logger.info(`[EHR Sync] Syncing external appointment ${data.externalScheduleId}`);
    const doctor = await this.doctorRepo.findByDoctorCode(data.doctorCode);
    if (!doctor) throw new Error(`Doctor code ${data.doctorCode} not found in hospital directory`);

    const patient = await this.syncPatientFromEHR(data.patientExternalId);

    const [dateStr, timeStr] = data.appointmentDateTime.split('T');
    return this.appointmentRepo.create(
      {
        patientId: patient.id,
        doctorId: doctor.id,
        departmentId: doctor.departmentId,
        scheduledDate: dateStr,
        scheduledTime: timeStr ? timeStr.substring(0, 5) : '09:00',
        type: data.type,
      },
      `APT-EHR-${Date.now().toString().slice(-6)}`
    );
  }

  async notifyEHRAppointmentStatus(appointmentId: string, status: string): Promise<boolean> {
    logger.info(`[EHR Outbound] Notifying external EHR system of appointment status change: ${appointmentId} -> ${status}`);
    return true;
  }

  async getDoctorByCode(code: string): Promise<DoctorWithDepartment | null> {
    return this.doctorRepo.findByDoctorCode(code);
  }

  async syncDoctorRoster(): Promise<DoctorWithDepartment[]> {
    return this.doctorRepo.listAll();
  }

  async broadcastToHospitalDisplay(displayUnitId: string, payload: any): Promise<boolean> {
    logger.info(`[Hospital TV Display] Broadcasting token update to display ${displayUnitId}`, payload);
    return true;
  }

  async reportQueueMetricsToHIS(hospitalId: string, metrics: any): Promise<boolean> {
    logger.info(`[HIS Analytics] Reporting queue throughput for ${hospitalId}`, metrics);
    return true;
  }
}
