import { AuditLogEntity, TravelPreferenceEntity } from '../../types/domain';

export interface CreateAuditLogDTO {
  actorId?: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  beforeState?: any;
  afterState?: any;
  reason?: string | null;
  metadata?: any;
}

export interface AuditLogFilterOptions {
  action?: string;
  actorRole?: string;
  actorId?: string;
  entity?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface IAuditRepository {
  create(data: CreateAuditLogDTO): Promise<AuditLogEntity>;
  findFiltered(filter: AuditLogFilterOptions): Promise<{ logs: AuditLogEntity[]; total: number }>;
}

export interface ITravelPreferenceRepository {
  findByPatientId(patientId: string): Promise<TravelPreferenceEntity | null>;
  upsert(patientId: string, data: { originAddress?: string | null; travelTimeMinutes: number; safetyBufferMinutes: number; transportMode?: string }): Promise<TravelPreferenceEntity>;
}
