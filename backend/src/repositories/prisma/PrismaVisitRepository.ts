import { prisma } from './prismaClient';
import { IVisitRepository, FullVisitDetails, CreateVisitDTO } from '../interfaces/IVisitRepository';
import { VisitStatus } from '../../config/constants';

export class PrismaVisitRepository implements IVisitRepository {
  async findById(id: string): Promise<FullVisitDetails | null> {
    const visit = await prisma.visit.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            travelPreference: true,
          },
        },
        doctor: {
          include: {
            department: true,
          },
        },
        token: true,
      },
    });
    return visit as FullVisitDetails | null;
  }

  async findByVisitCode(visitCode: string): Promise<FullVisitDetails | null> {
    const visit = await prisma.visit.findUnique({
      where: { visitCode },
      include: {
        patient: {
          include: {
            travelPreference: true,
          },
        },
        doctor: {
          include: {
            department: true,
          },
        },
        token: true,
      },
    });
    return visit as FullVisitDetails | null;
  }

  async findByPatientId(patientId: string): Promise<FullVisitDetails[]> {
    const visits = await prisma.visit.findMany({
      where: { patientId },
      include: {
        patient: {
          include: {
            travelPreference: true,
          },
        },
        doctor: {
          include: {
            department: true,
          },
        },
        token: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return visits as FullVisitDetails[];
  }

  async findByQueueId(queueId: string): Promise<FullVisitDetails[]> {
    const visits = await prisma.visit.findMany({
      where: { queueId },
      include: {
        patient: {
          include: {
            travelPreference: true,
          },
        },
        doctor: {
          include: {
            department: true,
          },
        },
        token: true,
      },
      orderBy: [
        { priorityLevel: 'desc' },
        { checkInTime: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    return visits as FullVisitDetails[];
  }

  async findActiveVisitByPatient(patientId: string, dateStr: string): Promise<FullVisitDetails | null> {
    const visit = await prisma.visit.findFirst({
      where: {
        patientId,
        queue: {
          queueDate: dateStr,
        },
        status: {
          in: ['BOOKED', 'CHECKED_IN', 'WAITING', 'CALLED', 'IN_CONSULTATION'],
        },
      },
      include: {
        patient: {
          include: {
            travelPreference: true,
          },
        },
        doctor: {
          include: {
            department: true,
          },
        },
        token: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return visit as FullVisitDetails | null;
  }

  async findVisitsByDateAndDoctor(doctorId: string, dateStr: string): Promise<FullVisitDetails[]> {
    const visits = await prisma.visit.findMany({
      where: {
        doctorId,
        queue: {
          queueDate: dateStr,
        },
      },
      include: {
        patient: {
          include: {
            travelPreference: true,
          },
        },
        doctor: {
          include: {
            department: true,
          },
        },
        token: true,
      },
      orderBy: [
        { priorityLevel: 'desc' },
        { checkInTime: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    return visits as FullVisitDetails[];
  }

  async create(data: CreateVisitDTO, visitCode: string): Promise<FullVisitDetails> {
    const visit = await prisma.visit.create({
      data: {
        visitCode,
        patientId: data.patientId,
        doctorId: data.doctorId,
        queueId: data.queueId,
        appointmentId: data.appointmentId || null,
        priorityLevel: data.priorityLevel ?? 0,
        notes: data.notes || null,
        status: data.status || 'BOOKED',
        checkInTime: data.checkInTime || (data.status === 'WAITING' || data.status === 'CHECKED_IN' ? new Date() : null),
      },
      include: {
        patient: {
          include: {
            travelPreference: true,
          },
        },
        doctor: {
          include: {
            department: true,
          },
        },
        token: true,
      },
    });
    return visit as FullVisitDetails;
  }

  async updateStatus(
    id: string,
    status: VisitStatus,
    timestamps?: {
      checkInTime?: Date;
      calledTime?: Date;
      consultationStartTime?: Date;
      consultationEndTime?: Date;
    }
  ): Promise<FullVisitDetails> {
    const visit = await prisma.visit.update({
      where: { id },
      data: {
        status,
        ...(timestamps?.checkInTime && { checkInTime: timestamps.checkInTime }),
        ...(timestamps?.calledTime && { calledTime: timestamps.calledTime }),
        ...(timestamps?.consultationStartTime && { consultationStartTime: timestamps.consultationStartTime }),
        ...(timestamps?.consultationEndTime && { consultationEndTime: timestamps.consultationEndTime }),
      },
      include: {
        patient: {
          include: {
            travelPreference: true,
          },
        },
        doctor: {
          include: {
            department: true,
          },
        },
        token: true,
      },
    });
    return visit as FullVisitDetails;
  }

  async reassignDoctor(
    id: string,
    newDoctorId: string,
    newQueueId: string,
    reason: string
  ): Promise<FullVisitDetails> {
    const existing = await prisma.visit.findUnique({ where: { id } });
    const visit = await prisma.visit.update({
      where: { id },
      data: {
        doctorId: newDoctorId,
        queueId: newQueueId,
        reassignedFromDoctorId: existing?.doctorId,
        reassignedReason: reason,
        status: 'WAITING',
      },
      include: {
        patient: {
          include: {
            travelPreference: true,
          },
        },
        doctor: {
          include: {
            department: true,
          },
        },
        token: true,
      },
    });
    return visit as FullVisitDetails;
  }

  async countByStatusAndDate(dateStr: string): Promise<Record<string, number>> {
    const visits = await prisma.visit.findMany({
      where: {
        queue: {
          queueDate: dateStr,
        },
      },
      select: {
        status: true,
      },
    });

    const result: Record<string, number> = {};
    for (const v of visits) {
      result[v.status] = (result[v.status] || 0) + 1;
    }
    return result;
  }
}
