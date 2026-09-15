import { PrismaPatientRepository } from '../repositories/prisma/PrismaPatientRepository';
import { PrismaDoctorRepository } from '../repositories/prisma/PrismaDoctorRepository';
import { PrismaVisitRepository } from '../repositories/prisma/PrismaVisitRepository';
import { PrismaQueueRepository } from '../repositories/prisma/PrismaQueueRepository';
import { PrismaAppointmentRepository } from '../repositories/prisma/PrismaAppointmentRepository';
import { PrismaNotificationRepository } from '../repositories/prisma/PrismaNotificationRepository';
import { PrismaAuditRepository } from '../repositories/prisma/PrismaAuditRepository';
import { PrismaTravelPreferenceRepository } from '../repositories/prisma/PrismaTravelPreferenceRepository';

import { NotificationService } from './notification/NotificationService';
import { AuditService } from './audit/AuditService';
import { QueueEngineService } from './queue/QueueEngineService';
import { AuthService } from './auth/AuthService';
import { AnalyticsService } from './analytics/AnalyticsService';
import { LocalEHRProvider } from '../providers/ehr/LocalEHRProvider';
import { DefaultRoutingProvider } from '../providers/routing/DefaultRoutingProvider';

// Instantiate Repositories
export const patientRepository = new PrismaPatientRepository();
export const doctorRepository = new PrismaDoctorRepository();
export const visitRepository = new PrismaVisitRepository();
export const queueRepository = new PrismaQueueRepository();
export const appointmentRepository = new PrismaAppointmentRepository();
export const notificationRepository = new PrismaNotificationRepository();
export const auditRepository = new PrismaAuditRepository();
export const travelPreferenceRepository = new PrismaTravelPreferenceRepository();

// Instantiate Services
export const notificationService = new NotificationService(notificationRepository);
export const auditService = new AuditService(auditRepository);
export const authService = new AuthService();
export const analyticsService = new AnalyticsService();

// Instantiate Core Queue Engine (Single Source of Truth)
export const queueEngineService = new QueueEngineService(
  queueRepository,
  visitRepository,
  doctorRepository,
  patientRepository,
  appointmentRepository,
  notificationService,
  auditService
);

// Instantiate EHR Provider and Routing Provider
export const localEHRProvider = new LocalEHRProvider(patientRepository, doctorRepository, appointmentRepository);
export const routingProvider = new DefaultRoutingProvider();
