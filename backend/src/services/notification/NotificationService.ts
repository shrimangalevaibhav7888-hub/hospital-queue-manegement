import { INotificationRepository, CreateNotificationDTO } from '../../repositories/interfaces/INotificationRepository';
import { ConsoleNotificationAdapter, INotificationAdapter } from './ConsoleNotificationAdapter';
import { NotificationEntity } from '../../types/domain';
import { socketEmitter } from '../../websocket/socketEmitter';

export interface DispatchNotificationOptions {
  recipientType: 'PATIENT' | 'DOCTOR' | 'STAFF';
  patientId?: string | null;
  userId?: string | null;
  patientPhone?: string | null;
  title: string;
  message: string;
  channel?: 'IN_APP' | 'SMS_MOCK' | 'PUSH_MOCK';
  eventType: string;
  metadata?: any;
}

export class NotificationService {
  private adapter: INotificationAdapter;

  constructor(
    private notificationRepo: INotificationRepository,
    adapter?: INotificationAdapter
  ) {
    this.adapter = adapter || new ConsoleNotificationAdapter();
  }

  async dispatch(options: DispatchNotificationOptions): Promise<NotificationEntity> {
    // 1. Persist notification
    const record = await this.notificationRepo.create({
      recipientType: options.recipientType,
      patientId: options.patientId,
      userId: options.userId,
      title: options.title,
      message: options.message,
      channel: options.channel || 'IN_APP',
      eventType: options.eventType,
      metadata: options.metadata,
    });

    // 2. Dispatch via simulated external channels
    if (options.patientPhone) {
      await this.adapter.sendSMS(options.patientPhone, `[CareFlow] ${options.title}: ${options.message}`);
    }
    if (options.userId) {
      await this.adapter.sendPush(options.userId, options.title, options.message);
    }

    // 3. Emit real-time notification via WebSocket
    socketEmitter.emitNotification({
      id: record.id,
      patientId: record.patientId,
      userId: record.userId,
      title: record.title,
      message: record.message,
      channel: record.channel,
      eventType: record.eventType,
      timestamp: record.createdAt.toISOString(),
    });

    return record;
  }

  async getPatientNotifications(patientId: string): Promise<NotificationEntity[]> {
    return this.notificationRepo.findByPatientId(patientId);
  }

  async getUserNotifications(userId: string): Promise<NotificationEntity[]> {
    return this.notificationRepo.findByUserId(userId);
  }

  async markAsRead(id: string): Promise<NotificationEntity> {
    return this.notificationRepo.markAsRead(id);
  }

  async markAllAsRead(userId?: string, patientId?: string): Promise<number> {
    return this.notificationRepo.markAllAsRead(userId, patientId);
  }
}
