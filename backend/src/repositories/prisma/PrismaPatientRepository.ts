import { prisma } from './prismaClient';
import { IPatientRepository, CreatePatientDTO, UpdatePatientDTO } from '../interfaces/IPatientRepository';
import { PatientEntity } from '../../types/domain';

export class PrismaPatientRepository implements IPatientRepository {
  async findById(id: string): Promise<PatientEntity | null> {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });
    return patient as PatientEntity | null;
  }

  async findByPatientCode(patientCode: string): Promise<PatientEntity | null> {
    const patient = await prisma.patient.findUnique({
      where: { patientCode },
    });
    return patient as PatientEntity | null;
  }

  async findByUserId(userId: string): Promise<PatientEntity | null> {
    const patient = await prisma.patient.findUnique({
      where: { userId },
    });
    return patient as PatientEntity | null;
  }

  async findByPhone(phone: string): Promise<PatientEntity | null> {
    const patient = await prisma.patient.findFirst({
      where: { phone },
    });
    return patient as PatientEntity | null;
  }

  async search(query: string): Promise<PatientEntity[]> {
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { patientCode: { contains: query } },
          { phone: { contains: query } },
          { email: { contains: query } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
    return patients as PatientEntity[];
  }

  async listAll(limit = 100): Promise<PatientEntity[]> {
    const patients = await prisma.patient.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return patients as PatientEntity[];
  }

  async create(data: CreatePatientDTO, patientCode: string): Promise<PatientEntity> {
    const patient = await prisma.patient.create({
      data: {
        patientCode,
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || null,
        address: data.address || null,
        emergencyContact: data.emergencyContact || null,
        userId: data.userId || null,
        travelPreference: {
          create: {
            travelTimeMinutes: 25,
            safetyBufferMinutes: 10,
            transportMode: 'DRIVING',
          },
        },
      },
    });
    return patient as PatientEntity;
  }

  async update(id: string, data: UpdatePatientDTO): Promise<PatientEntity> {
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.gender && { gender: data.gender }),
        ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.emergencyContact !== undefined && { emergencyContact: data.emergencyContact }),
      },
    });
    return patient as PatientEntity;
  }

  async count(): Promise<number> {
    return prisma.patient.count();
  }
}
