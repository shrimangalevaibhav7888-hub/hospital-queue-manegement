import { prisma } from './prismaClient';
import { IQueueRepository } from '../interfaces/IQueueRepository';
import { QueueEntity, TokenEntity } from '../../types/domain';
import { QueueStatus } from '../../config/constants';

export class PrismaQueueRepository implements IQueueRepository {
  async findById(id: string): Promise<QueueEntity | null> {
    const queue = await prisma.queue.findUnique({
      where: { id },
    });
    return queue as QueueEntity | null;
  }

  async findByDoctorAndDate(doctorId: string, queueDate: string): Promise<QueueEntity | null> {
    const queue = await prisma.queue.findUnique({
      where: {
        doctorId_queueDate: {
          doctorId,
          queueDate,
        },
      },
    });
    return queue as QueueEntity | null;
  }

  async findOrCreateByDoctorAndDate(doctorId: string, queueDate: string): Promise<QueueEntity> {
    const existing = await this.findByDoctorAndDate(doctorId, queueDate);
    if (existing) {
      return existing;
    }

    const created = await prisma.queue.create({
      data: {
        doctorId,
        queueDate,
        status: 'ACTIVE',
        currentNumber: 0,
        totalTokens: 0,
      },
    });
    return created as QueueEntity;
  }

  async listActiveQueues(dateStr: string): Promise<QueueEntity[]> {
    const queues = await prisma.queue.findMany({
      where: {
        queueDate: dateStr,
      },
      include: {
        doctor: {
          include: {
            department: true,
          },
        },
      },
    });
    return queues as QueueEntity[];
  }

  async updateStatus(id: string, status: QueueStatus): Promise<QueueEntity> {
    const queue = await prisma.queue.update({
      where: { id },
      data: { status },
    });
    return queue as QueueEntity;
  }

  async incrementTokenCount(id: string): Promise<number> {
    const queue = await prisma.queue.update({
      where: { id },
      data: {
        totalTokens: { increment: 1 },
      },
    });
    return queue.totalTokens;
  }

  async getNextTokenNumber(doctorId: string, queueDate: string): Promise<number> {
    const maxToken = await prisma.token.findFirst({
      where: {
        doctorId,
        queueDate,
      },
      orderBy: {
        tokenNumber: 'desc',
      },
      select: {
        tokenNumber: true,
      },
    });
    return (maxToken?.tokenNumber || 0) + 1;
  }

  async createToken(
    visitId: string,
    doctorId: string,
    queueDate: string,
    tokenNumber: number,
    tokenDisplay: string
  ): Promise<TokenEntity> {
    const token = await prisma.token.create({
      data: {
        visitId,
        doctorId,
        queueDate,
        tokenNumber,
        tokenDisplay,
      },
    });
    return token as TokenEntity;
  }

  async findTokenByVisitId(visitId: string): Promise<TokenEntity | null> {
    const token = await prisma.token.findUnique({
      where: { visitId },
    });
    return token as TokenEntity | null;
  }
}
