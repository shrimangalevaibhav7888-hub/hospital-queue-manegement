import { VisitEntity, TokenEntity, PatientEntity, DoctorEntity, TravelPreferenceEntity, DepartmentEntity } from '../../types/domain';
import { VisitStatus, PriorityLevel } from '../../config/constants';

export interface FullVisitDetails extends VisitEntity {
  patient: PatientEntity & { travelPreference?: TravelPreferenceEntity | null };
  doctor: DoctorEntity & { department: DepartmentEntity };
  token?: TokenEntity | null;
}

export interface CreateVisitDTO {
  patientId: string;
  doctorId: string;
  queueId: string;
  appointmentId?: string | null;
  priorityLevel?: PriorityLevel;
  notes?: string | null;
  status?: VisitStatus;
  checkInTime?: Date | null;
}

export interface IVisitRepository {
  findById(id: string): Promise<FullVisitDetails | null>;
  findByVisitCode(visitCode: string): Promise<FullVisitDetails | null>;
  findByPatientId(patientId: string): Promise<FullVisitDetails[]>;
  findByQueueId(queueId: string): Promise<FullVisitDetails[]>;
  findActiveVisitByPatient(patientId: string, dateStr: string): Promise<FullVisitDetails | null>;
  findVisitsByDateAndDoctor(doctorId: string, dateStr: string): Promise<FullVisitDetails[]>;
  create(data: CreateVisitDTO, visitCode: string): Promise<FullVisitDetails>;
  updateStatus(
    id: string,
    status: VisitStatus,
    timestamps?: {
      checkInTime?: Date;
      calledTime?: Date;
      consultationStartTime?: Date;
      consultationEndTime?: Date;
    }
  ): Promise<FullVisitDetails>;
  reassignDoctor(id: string, newDoctorId: string, newQueueId: string, reason: string): Promise<FullVisitDetails>;
  countByStatusAndDate(dateStr: string): Promise<Record<string, number>>;
}
