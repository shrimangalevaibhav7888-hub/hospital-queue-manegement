import { prisma } from './prismaClient';
import { IAuditRepository, CreateAuditLogDTO, AuditLogFilterOptions } from '../interfaces/IAuditRepository';
import { AuditLogEntity } from '../../types/domain';

export class PrismaAuditRepository implements IAuditRepository {
  async create(data: CreateAuditLogDTO): Promise<AuditLogEntity> {
    const log = await prisma.auditLog.create({
      data: {
        actorId: data.actorId || null,
        actorName: data.actorName,
        actorRole: data.actorRole,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        beforeState: data.beforeState ? JSON.stringify(data.beforeState) : null,
        afterState: data.afterState ? JSON.stringify(data.afterState) : null,
        reason: data.reason || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
    return log as AuditLogEntity;
  }

  async findFiltered(filter: AuditLogFilterOptions): Promise<{ logs: AuditLogEntity[]; total: number }> {
    const where: any = {};

    if (filter.action) where.action = filter.action;
    if (filter.actorRole) where.actorRole = filter.actorRole;
    if (filter.actorId) where.actorId = filter.actorId;
    if (filter.entity) where.entity = filter.entity;
    if (filter.entityId) where.entityId = filter.entityId;

    if (filter.startDate || filter.endDate) {
      where.timestamp = {};
      if (filter.startDate) where.timestamp.gte = filter.startDate;
      if (filter.endDate) where.timestamp.lte = filter.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        take: filter.limit || 50,
        skip: filter.offset || 0,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs as AuditLogEntity[],
      total,
    };
  }
}
