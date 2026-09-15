import { DoctorEntity, DepartmentEntity } from '../../types/domain';
import { DoctorStatus } from '../../config/constants';

export interface DoctorWithDepartment extends DoctorEntity {
  department: DepartmentEntity;
}

export interface IDoctorRepository {
  findById(id: string): Promise<DoctorWithDepartment | null>;
  findByUserId(userId: string): Promise<DoctorWithDepartment | null>;
  findByDoctorCode(doctorCode: string): Promise<DoctorWithDepartment | null>;
  listAll(departmentId?: string): Promise<DoctorWithDepartment[]>;
  updateStatus(id: string, status: DoctorStatus, delayMinutes?: number, delayReason?: string | null): Promise<DoctorEntity>;
  updateDelay(id: string, delayMinutes: number, reason: string): Promise<DoctorEntity>;
  listDepartments(): Promise<DepartmentEntity[]>;
  findDepartmentById(id: string): Promise<DepartmentEntity | null>;
}
