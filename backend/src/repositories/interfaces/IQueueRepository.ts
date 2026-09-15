import { QueueEntity, TokenEntity } from '../../types/domain';
import { QueueStatus } from '../../config/constants';

export interface IQueueRepository {
  findById(id: string): Promise<QueueEntity | null>;
  findOrCreateByDoctorAndDate(doctorId: string, queueDate: string): Promise<QueueEntity>;
  findByDoctorAndDate(doctorId: string, queueDate: string): Promise<QueueEntity | null>;
  listActiveQueues(dateStr: string): Promise<QueueEntity[]>;
  updateStatus(id: string, status: QueueStatus): Promise<QueueEntity>;
  incrementTokenCount(id: string): Promise<number>;
  createToken(visitId: string, doctorId: string, queueDate: string, tokenNumber: number, tokenDisplay: string): Promise<TokenEntity>;
  findTokenByVisitId(visitId: string): Promise<TokenEntity | null>;
  getNextTokenNumber(doctorId: string, queueDate: string): Promise<number>;
}
