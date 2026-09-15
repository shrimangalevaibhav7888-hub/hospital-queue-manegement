import { PatientEntity, DoctorEntity, DepartmentEntity } from '../../types/domain';

export interface AppointmentEntity {
  id: string;
  appointmentCode: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  type: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FullAppointmentDetails extends AppointmentEntity {
  patient: PatientEntity;
  doctor: DoctorEntity & { department: DepartmentEntity };
  department: DepartmentEntity;
}

export interface CreateAppointmentDTO {
  patientId: string;
  doctorId: string;
  departmentId: string;
  scheduledDate: string;
  scheduledTime: string;
  type?: string;
  notes?: string | null;
}

export interface IAppointmentRepository {
  findById(id: string): Promise<FullAppointmentDetails | null>;
  findByCode(appointmentCode: string): Promise<FullAppointmentDetails | null>;
  findByPatientId(patientId: string): Promise<FullAppointmentDetails[]>;
  findByDoctorAndDate(doctorId: string, dateStr: string): Promise<FullAppointmentDetails[]>;
  findAll(filters?: { date?: string; status?: string; doctorId?: string }): Promise<FullAppointmentDetails[]>;
  create(data: CreateAppointmentDTO, appointmentCode: string): Promise<FullAppointmentDetails>;
  updateStatus(id: string, status: string): Promise<FullAppointmentDetails>;
  countByDate(dateStr: string): Promise<number>;
}
