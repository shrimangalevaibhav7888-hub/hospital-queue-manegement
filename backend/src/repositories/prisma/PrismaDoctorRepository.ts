import { prisma } from './prismaClient';
import { IDoctorRepository, DoctorWithDepartment } from '../interfaces/IDoctorRepository';
import { DoctorEntity, DepartmentEntity } from '../../types/domain';
import { DoctorStatus } from '../../config/constants';

export class PrismaDoctorRepository implements IDoctorRepository {
  async findById(id: string): Promise<DoctorWithDepartment | null> {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });
    return doctor as DoctorWithDepartment | null;
  }

  async findByUserId(userId: string): Promise<DoctorWithDepartment | null> {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: {
        department: true,
      },
    });
    return doctor as DoctorWithDepartment | null;
  }

  async findByDoctorCode(doctorCode: string): Promise<DoctorWithDepartment | null> {
    const doctor = await prisma.doctor.findUnique({
      where: { doctorCode },
      include: {
        department: true,
      },
    });
    return doctor as DoctorWithDepartment | null;
  }

  async listAll(departmentId?: string): Promise<DoctorWithDepartment[]> {
    const doctors = await prisma.doctor.findMany({
      where: {
        ...(departmentId && { departmentId }),
      },
      include: {
        department: true,
      },
      orderBy: { name: 'asc' },
    });
    return doctors as DoctorWithDepartment[];
  }

  async updateStatus(
    id: string,
    status: DoctorStatus,
    delayMinutes = 0,
    delayReason?: string | null
  ): Promise<DoctorEntity> {
    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        status,
        currentDelayMinutes: delayMinutes,
        delayReason: delayReason || null,
      },
    });
    return doctor as DoctorEntity;
  }

  async updateDelay(id: string, delayMinutes: number, reason: string): Promise<DoctorEntity> {
    const [doctor] = await prisma.$transaction([
      prisma.doctor.update({
        where: { id },
        data: {
          currentDelayMinutes: delayMinutes,
          delayReason: reason,
          status: delayMinutes > 0 ? 'DELAYED' : 'AVAILABLE',
        },
      }),
      prisma.doctorDelay.create({
        data: {
          doctorId: id,
          delayMinutes,
          reason,
        },
      }),
    ]);
    return doctor as DoctorEntity;
  }

  async listDepartments(): Promise<DepartmentEntity[]> {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
    return departments as DepartmentEntity[];
  }

  async findDepartmentById(id: string): Promise<DepartmentEntity | null> {
    const department = await prisma.department.findUnique({
      where: { id },
    });
    return department as DepartmentEntity | null;
  }
}
