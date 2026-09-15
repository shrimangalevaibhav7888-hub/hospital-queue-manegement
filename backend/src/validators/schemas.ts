import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN']),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  doctorSpecialization: z.string().optional(),
  departmentId: z.string().optional(),
  roomNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const checkInSchema = z.object({
  patientId: z.string().optional(),
  patientCode: z.string().optional(),
  appointmentId: z.string().optional(),
  doctorId: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  priorityLevel: z.number().min(0).max(2).optional(),
  notes: z.string().optional(),
});

export const emergencyInsertSchema = z.object({
  doctorId: z.string(),
  name: z.string().min(2),
  phone: z.string().min(5),
  gender: z.string().optional(),
  priorityLevel: z.literal(2),
  reason: z.string().min(3),
  notes: z.string().optional(),
});

export const reportDelaySchema = z.object({
  doctorId: z.string(),
  delayMinutes: z.number().min(0).max(180),
  reason: z.string().min(2),
});

export const pauseQueueSchema = z.object({
  doctorId: z.string(),
  reason: z.string().min(2),
});

export const reassignPatientSchema = z.object({
  visitId: z.string(),
  targetDoctorId: z.string(),
  reason: z.string().min(2),
});

export const reassignQueueSchema = z.object({
  fromDoctorId: z.string(),
  toDoctorId: z.string(),
  reason: z.string().min(2),
});

export const completeConsultationSchema = z.object({
  actualDurationMinutes: z.number().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTravelPreferenceSchema = z.object({
  originAddress: z.string().optional().nullable(),
  travelTimeMinutes: z.number().min(1).max(300),
  safetyBufferMinutes: z.number().min(0).max(120),
  transportMode: z.enum(['DRIVING', 'TRANSIT', 'WALKING']).optional(),
});

export const createAppointmentSchema = z.object({
  doctorId: z.string(),
  departmentId: z.string(),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  type: z.enum(['ONLINE', 'WALK_IN', 'FOLLOW_UP']).optional(),
  notes: z.string().optional(),
});

export const cancelVisitSchema = z.object({
  reason: z.string().min(2),
});
