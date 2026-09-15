import { IAuditRepository, CreateAuditLogDTO, AuditLogFilterOptions } from '../../repositories/interfaces/IAuditRepository';
import { AuditLogEntity } from '../../types/domain';
import { logger } from '../../utils/logger';

export class AuditService {
  constructor(private auditRepo: IAuditRepository) {}

  async log(entry: CreateAuditLogDTO): Promise<AuditLogEntity> {
    logger.debug(`[AuditLog] ${entry.actorRole} (${entry.actorName}) performed ${entry.action} on ${entry.entity}:${entry.entityId}`);
    return this.auditRepo.create(entry);
  }

  async getLogs(filter: AuditLogFilterOptions): Promise<{ logs: AuditLogEntity[]; total: number }> {
    return this.auditRepo.findFiltered(filter);
  }
}
