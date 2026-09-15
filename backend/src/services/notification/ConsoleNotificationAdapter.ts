import { logger } from '../../utils/logger';

export interface INotificationAdapter {
  sendSMS(phone: string, message: string): Promise<boolean>;
  sendPush(targetToken: string, title: string, body: string): Promise<boolean>;
}

export class ConsoleNotificationAdapter implements INotificationAdapter {
  async sendSMS(phone: string, message: string): Promise<boolean> {
    logger.sms(phone, message);
    return true;
  }

  async sendPush(targetToken: string, title: string, body: string): Promise<boolean> {
    logger.push(targetToken, title, body);
    return true;
  }
}
