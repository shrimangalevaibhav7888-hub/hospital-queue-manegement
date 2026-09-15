import { prisma } from './prismaClient';
import { ITravelPreferenceRepository } from '../interfaces/IAuditRepository';
import { TravelPreferenceEntity } from '../../types/domain';

export class PrismaTravelPreferenceRepository implements ITravelPreferenceRepository {
  async findByPatientId(patientId: string): Promise<TravelPreferenceEntity | null> {
    const pref = await prisma.travelPreference.findUnique({
      where: { patientId },
    });
    return pref as TravelPreferenceEntity | null;
  }

  async upsert(
    patientId: string,
    data: {
      originAddress?: string | null;
      travelTimeMinutes: number;
      safetyBufferMinutes: number;
      transportMode?: string;
    }
  ): Promise<TravelPreferenceEntity> {
    const pref = await prisma.travelPreference.upsert({
      where: { patientId },
      update: {
        originAddress: data.originAddress !== undefined ? data.originAddress : undefined,
        travelTimeMinutes: data.travelTimeMinutes,
        safetyBufferMinutes: data.safetyBufferMinutes,
        ...(data.transportMode && { transportMode: data.transportMode }),
      },
      create: {
        patientId,
        originAddress: data.originAddress || null,
        travelTimeMinutes: data.travelTimeMinutes,
        safetyBufferMinutes: data.safetyBufferMinutes,
        transportMode: data.transportMode || 'DRIVING',
      },
    });
    return pref as TravelPreferenceEntity;
  }
}
