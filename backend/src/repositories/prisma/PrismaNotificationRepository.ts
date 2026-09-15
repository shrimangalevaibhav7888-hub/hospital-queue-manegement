import { prisma } from './prismaClient';
import { INotificationRepository, CreateNotificationDTO } from '../interfaces/INotificationRepository';
import { NotificationEntity } from '../../types/domain';

export class PrismaNotificationRepository implements INotificationRepository {
  async create(data: CreateNotificationDTO): Promise<NotificationEntity> {
    const notif = await prisma.notification.create({
      data: {
        recipientType: data.recipientType,
        patientId: data.patientId || null,
        userId: data.userId || null,
        title: data.title,
        message: data.message,
        channel: data.channel || 'IN_APP',
        eventType: data.eventType,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
    return notif as NotificationEntity;
  }

  async findByUserId(userId: string, limit = 50): Promise<NotificationEntity[]> {
    const notifs = await prisma.notification.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return notifs as NotificationEntity[];
  }

  async findByPatientId(patientId: string, limit = 50): Promise<NotificationEntity[]> {
    const notifs = await prisma.notification.findMany({
      where: { patientId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return notifs as NotificationEntity[];
  }

  async markAsRead(id: string): Promise<NotificationEntity> {
    const notif = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return notif as NotificationEntity;
  }

  async markAllAsRead(userId?: string, patientId?: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        ...(userId && { userId }),
        ...(patientId && { patientId }),
        isRead: false,
      },
      data: { isRead: true },
    });
    return result.count;
  }
}
