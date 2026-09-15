import { NotificationEntity } from '../../types/domain';

export interface CreateNotificationDTO {
  recipientType: 'PATIENT' | 'DOCTOR' | 'STAFF';
  patientId?: string | null;
  userId?: string | null;
  title: string;
  message: string;
  channel?: string;
  eventType: string;
  metadata?: any;
}

export interface INotificationRepository {
  create(data: CreateNotificationDTO): Promise<NotificationEntity>;
  findByUserId(userId: string, limit?: number): Promise<NotificationEntity[]>;
  findByPatientId(patientId: string, limit?: number): Promise<NotificationEntity[]>;
  markAsRead(id: string): Promise<NotificationEntity>;
  markAllAsRead(userId?: string, patientId?: string): Promise<number>;
}
