import { prisma } from './prismaClient';
import { IAppointmentRepository, FullAppointmentDetails, CreateAppointmentDTO } from '../interfaces/IAppointmentRepository';

export class PrismaAppointmentRepository implements IAppointmentRepository {
  async findById(id: string): Promise<FullAppointmentDetails | null> {
    const apt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: {
          include: {
            department: true,
          },
        },
        department: true,
      },
    });
    return apt as FullAppointmentDetails | null;
  }

  async findByCode(appointmentCode: string): Promise<FullAppointmentDetails | null> {
    const apt = await prisma.appointment.findUnique({
      where: { appointmentCode },
      include: {
        patient: true,
        doctor: {
          include: {
            department: true,
          },
        },
        department: true,
      },
    });
    return apt as FullAppointmentDetails | null;
  }

  async findByPatientId(patientId: string): Promise<FullAppointmentDetails[]> {
    const apts = await prisma.appointment.findMany({
      where: { patientId },
      include: {
        patient: true,
        doctor: {
          include: {
            department: true,
          },
        },
        department: true,
      },
      orderBy: { scheduledDate: 'desc' },
    });
    return apts as FullAppointmentDetails[];
  }

  async findByDoctorAndDate(doctorId: string, dateStr: string): Promise<FullAppointmentDetails[]> {
    const apts = await prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledDate: dateStr,
      },
      include: {
        patient: true,
        doctor: {
          include: {
            department: true,
          },
        },
        department: true,
      },
      orderBy: { scheduledTime: 'asc' },
    });
    return apts as FullAppointmentDetails[];
  }

  async findAll(filters?: { date?: string; status?: string; doctorId?: string }): Promise<FullAppointmentDetails[]> {
    const where: any = {};
    if (filters?.date) where.scheduledDate = filters.date;
    if (filters?.status) where.status = filters.status;
    if (filters?.doctorId) where.doctorId = filters.doctorId;

    const apts = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: {
          include: {
            department: true,
          },
        },
        department: true,
      },
      orderBy: [{ scheduledDate: 'desc' }, { scheduledTime: 'asc' }],
      take: 100,
    });
    return apts as FullAppointmentDetails[];
  }

  async create(data: CreateAppointmentDTO, appointmentCode: string): Promise<FullAppointmentDetails> {
    const apt = await prisma.appointment.create({
      data: {
        appointmentCode,
        patientId: data.patientId,
        doctorId: data.doctorId,
        departmentId: data.departmentId,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        type: data.type || 'ONLINE',
        notes: data.notes || null,
        status: 'BOOKED',
      },
      include: {
        patient: true,
        doctor: {
          include: {
            department: true,
          },
        },
        department: true,
      },
    });
    return apt as FullAppointmentDetails;
  }

  async updateStatus(id: string, status: string): Promise<FullAppointmentDetails> {
    const apt = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: true,
        doctor: {
          include: {
            department: true,
          },
        },
        department: true,
      },
    });
    return apt as FullAppointmentDetails;
  }

  async countByDate(dateStr: string): Promise<number> {
    return prisma.appointment.count({
      where: { scheduledDate: dateStr },
    });
  }
}
