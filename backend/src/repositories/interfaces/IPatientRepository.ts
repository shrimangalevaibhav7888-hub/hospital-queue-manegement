import { PatientEntity } from '../../types/domain';

export interface CreatePatientDTO {
  name: string;
  email?: string | null;
  phone: string;
  gender: string;
  dateOfBirth?: Date | null;
  address?: string | null;
  emergencyContact?: string | null;
  userId?: string | null;
}

export interface UpdatePatientDTO {
  name?: string;
  email?: string | null;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date | null;
  address?: string | null;
  emergencyContact?: string | null;
}

export interface IPatientRepository {
  findById(id: string): Promise<PatientEntity | null>;
  findByPatientCode(patientCode: string): Promise<PatientEntity | null>;
  findByUserId(userId: string): Promise<PatientEntity | null>;
  findByPhone(phone: string): Promise<PatientEntity | null>;
  search(query: string): Promise<PatientEntity[]>;
  listAll(limit?: number): Promise<PatientEntity[]>;
  create(data: CreatePatientDTO, patientCode: string): Promise<PatientEntity>;
  update(id: string, data: UpdatePatientDTO): Promise<PatientEntity>;
  count(): Promise<number>;
}
