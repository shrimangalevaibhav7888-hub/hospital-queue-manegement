import { format } from 'date-fns';
import { IQueueRepository } from '../../repositories/interfaces/IQueueRepository';
import { IVisitRepository, FullVisitDetails } from '../../repositories/interfaces/IVisitRepository';
import { IDoctorRepository } from '../../repositories/interfaces/IDoctorRepository';
import { IPatientRepository } from '../../repositories/interfaces/IPatientRepository';
import { IAppointmentRepository } from '../../repositories/interfaces/IAppointmentRepository';
import { NotificationService } from '../notification/NotificationService';
import { AuditService } from '../audit/AuditService';
import { ETACalculator } from './ETACalculator';
import { SmartArrivalService } from './SmartArrivalService';
import { QueueStateMachine, QueueStateError } from './QueueStateMachine';
import { socketEmitter } from '../../websocket/socketEmitter';
import { QueueStateSummary, CalculatedQueueItem, PatientQueueView } from '../../types/queue';
import { VisitStatus, PriorityLevel } from '../../config/constants';
import { logger } from '../../utils/logger';

export interface CheckInDTO {
  patientId?: string;
  patientCode?: string;
  appointmentId?: string;
  doctorId?: string;
  name?: string;
  phone?: string;
  gender?: string;
  priorityLevel?: PriorityLevel;
  notes?: string;
  actor: { id?: string; name: string; role: string };
}

export interface CompleteConsultationDTO {
  actualDurationMinutes?: number;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  actor: { id?: string; name: string; role: string };
}

export class QueueEngineService {
  constructor(
    private queueRepo: IQueueRepository,
    private visitRepo: IVisitRepository,
    private doctorRepo: IDoctorRepository,
    private patientRepo: IPatientRepository,
    private appointmentRepo: IAppointmentRepository,
    private notificationService: NotificationService,
    private auditService: AuditService
  ) {}

  /**
   * Helper to get today's date string YYYY-MM-DD
   */
  private getTodayDateStr(): string {
    return format(new Date(), 'yyyy-MM-dd');
  }

  /**
   * Core Golden Pipeline: Recalculates ordering, positions, dynamic ETAs, smart arrivals, and broadcasts
   */
  async recalculateQueue(queueId: string): Promise<QueueStateSummary> {
    const queue = await this.queueRepo.findById(queueId);
    if (!queue) {
      throw new Error(`Queue ${queueId} not found`);
    }

    const doctor = await this.doctorRepo.findById(queue.doctorId);
    if (!doctor) {
      throw new Error(`Doctor ${queue.doctorId} not found`);
    }

    // 1. Fetch all visits for this queue
    const allVisits = await this.visitRepo.findByQueueId(queueId);

    // 2. Identify active visit states
    const activeInConsultation = allVisits.find((v) => v.status === 'IN_CONSULTATION') || null;
    const currentlyCalled = allVisits.find((v) => v.status === 'CALLED') || null;

    // Filter waiting visits
    const waitingVisits = allVisits.filter(
      (v) => v.status === 'WAITING' || v.status === 'CHECKED_IN'
    );

    // 3. Deterministic Fair Ordering:
    // Priority: EMERGENCY (2) > PRIORITY (1) > NORMAL (0)
    // Within same priority: checkInTime ASC, then createdAt ASC
    waitingVisits.sort((a, b) => {
      if (b.priorityLevel !== a.priorityLevel) {
        return b.priorityLevel - a.priorityLevel;
      }
      const timeA = a.checkInTime ? new Date(a.checkInTime).getTime() : new Date(a.createdAt).getTime();
      const timeB = b.checkInTime ? new Date(b.checkInTime).getTime() : new Date(b.createdAt).getTime();
      return timeA - timeB;
    });

    const now = new Date();
    const calculatedItems: CalculatedQueueItem[] = [];

    // 4. Calculate dynamic Position, ETA, and Smart Leave-Home Time for each waiting patient
    for (let index = 0; index < waitingVisits.length; index++) {
      const visit = waitingVisits[index];
      const position = index + 1;
      const patientsAhead = index + (currentlyCalled ? 1 : 0);

      // ETA Calculation
      const etaOutput = ETACalculator.calculate({
        patientsAhead,
        avgConsultationDurationMinutes: doctor.avgConsultationDuration,
        doctorDelayMinutes: doctor.currentDelayMinutes,
        isDoctorOnBreak: doctor.status === 'ON_BREAK',
        currentConsultationStartTime: activeInConsultation?.consultationStartTime || null,
        baseTime: now,
      });

      // Travel preferences
      const travelTime = visit.patient.travelPreference?.travelTimeMinutes ?? 25;
      const safetyBuffer = visit.patient.travelPreference?.safetyBufferMinutes ?? 10;

      // Smart Arrival calculation
      const smartArrivalOutput = SmartArrivalService.calculate({
        estimatedConsultationTime: etaOutput.estimatedConsultationTime,
        travelTimeMinutes: travelTime,
        safetyBufferMinutes: safetyBuffer,
        currentTime: now,
      });

      calculatedItems.push({
        visitId: visit.id,
        visitCode: visit.visitCode,
        patientId: visit.patientId,
        patientCode: visit.patient.patientCode,
        patientName: visit.patient.name,
        tokenDisplay: visit.token?.tokenDisplay || `T-${visit.visitCode.slice(-4)}`,
        tokenNumber: visit.token?.tokenNumber || position,
        priorityLevel: visit.priorityLevel,
        status: visit.status,
        checkInTime: visit.checkInTime || visit.createdAt,
        calledTime: visit.calledTime,
        consultationStartTime: visit.consultationStartTime,
        position,
        patientsAhead,
        estimatedWaitMinutes: etaOutput.estimatedWaitMinutes,
        estimatedConsultationTime: etaOutput.estimatedConsultationTime.toISOString(),
        smartLeaveHomeTime: smartArrivalOutput.smartLeaveHomeTime.toISOString(),
        travelTimeMinutes: travelTime,
        safetyBufferMinutes: safetyBuffer,
      });
    }

    // Convert currently called and in-consultation items
    const convertToItem = (v: FullVisitDetails): CalculatedQueueItem => {
      const travel = v.patient.travelPreference?.travelTimeMinutes ?? 25;
      const buffer = v.patient.travelPreference?.safetyBufferMinutes ?? 10;
      return {
        visitId: v.id,
        visitCode: v.visitCode,
        patientId: v.patientId,
        patientCode: v.patient.patientCode,
        patientName: v.patient.name,
        tokenDisplay: v.token?.tokenDisplay || `T-${v.visitCode.slice(-4)}`,
        tokenNumber: v.token?.tokenNumber || 0,
        priorityLevel: v.priorityLevel,
        status: v.status,
        checkInTime: v.checkInTime || v.createdAt,
        calledTime: v.calledTime,
        consultationStartTime: v.consultationStartTime,
        position: 0,
        patientsAhead: 0,
        estimatedWaitMinutes: 0,
        estimatedConsultationTime: now.toISOString(),
        smartLeaveHomeTime: now.toISOString(),
        travelTimeMinutes: travel,
        safetyBufferMinutes: buffer,
      };
    };

    const currentlyCallingItem = currentlyCalled ? convertToItem(currentlyCalled) : null;
    const inConsultationItem = activeInConsultation ? convertToItem(activeInConsultation) : null;

    // 5. Aggregate queue stats
    const completedCount = allVisits.filter((v) => v.status === 'COMPLETED').length;
    const noShowCount = allVisits.filter((v) => v.status === 'NO_SHOW').length;

    const summary: QueueStateSummary = {
      queueId: queue.id,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorCode: doctor.doctorCode,
      doctorStatus: doctor.status,
      specialization: doctor.specialization,
      roomNumber: doctor.roomNumber,
      queueDate: queue.queueDate,
      status: queue.status,
      currentNumber: currentlyCalled?.token?.tokenNumber || activeInConsultation?.token?.tokenNumber || queue.currentNumber,
      totalTokens: queue.totalTokens,
      currentDelayMinutes: doctor.currentDelayMinutes,
      delayReason: doctor.delayReason,
      waitingCount: calculatedItems.length,
      inConsultationCount: activeInConsultation ? 1 : 0,
      completedCount,
      noShowCount,
      avgWaitTimeMinutes: calculatedItems.length > 0 ? calculatedItems[0].estimatedWaitMinutes : 0,
      avgConsultationDuration: doctor.avgConsultationDuration,
      items: calculatedItems,
      currentlyCalling: currentlyCallingItem,
      inConsultation: inConsultationItem,
    };

    // 6. Broadcast updated state through WebSocket
    socketEmitter.emitQueueUpdated(summary);

    return summary;
  }

  /**
   * Atomic Token Generation: Doctor + Date + Sequence
   */
  async generateToken(doctorId: string, queueDate: string, visitId: string): Promise<string> {
    const doctor = await this.doctorRepo.findById(doctorId);
    if (!doctor) throw new Error(`Doctor ${doctorId} not found`);

    const queue = await this.queueRepo.findOrCreateByDoctorAndDate(doctorId, queueDate);
    const tokenNumber = await this.queueRepo.getNextTokenNumber(doctorId, queueDate);
    await this.queueRepo.incrementTokenCount(queue.id);

    // Format: DR-<DoctorInitial>-<000> e.g. DR-S-015
    const docInitials = doctor.name.replace('Dr. ', '').substring(0, 1).toUpperCase() || 'D';
    const padded = String(tokenNumber).padStart(3, '0');
    const tokenDisplay = `DR-${docInitials}-${padded}`;

    await this.queueRepo.createToken(visitId, doctorId, queueDate, tokenNumber, tokenDisplay);

    return tokenDisplay;
  }

  /**
   * Patient Check-in: Online or Walk-In
   */
  async checkInPatient(dto: CheckInDTO): Promise<{ visit: FullVisitDetails; summary: QueueStateSummary }> {
    const today = this.getTodayDateStr();
    let patientId = dto.patientId;

    // 1. Resolve or Create Patient
    if (!patientId && dto.patientCode) {
      const p = await this.patientRepo.findByPatientCode(dto.patientCode);
      if (p) patientId = p.id;
    }

    if (!patientId && dto.name && dto.phone) {
      // Find by phone or create new patient
      let p = await this.patientRepo.findByPhone(dto.phone);
      if (!p) {
        const count = await this.patientRepo.count();
        const randSuffix = Math.floor(1000 + Math.random() * 9000);
        const patientCode = `PAT-${100000 + count + randSuffix}`;
        p = await this.patientRepo.create(
          {
            name: dto.name,
            phone: dto.phone,
            gender: dto.gender || 'OTHER',
          },
          patientCode
        );
      }
      patientId = p.id;
    }

    if (!patientId) {
      throw new Error('Patient identity (ID, Code, or Name+Phone) is required for check-in');
    }

    const patient = await this.patientRepo.findById(patientId);
    if (!patient) throw new Error(`Patient ${patientId} not found`);

    // 2. Resolve Doctor & Appointment
    let doctorId = dto.doctorId;
    let appointmentId = dto.appointmentId;

    if (appointmentId) {
      const apt = await this.appointmentRepo.findById(appointmentId);
      if (!apt) throw new Error(`Appointment ${appointmentId} not found`);
      doctorId = apt.doctorId;
      await this.appointmentRepo.updateStatus(appointmentId, 'CHECKED_IN');
    }

    if (!doctorId) {
      const doctors = await this.doctorRepo.listAll();
      if (doctors.length === 0) throw new Error('No doctors available in the system');
      doctorId = doctors[0].id;
    }

    const doctor = await this.doctorRepo.findById(doctorId);
    if (!doctor) throw new Error(`Doctor ${doctorId} not found`);

    // 3. Ensure Active Queue for today
    const queue = await this.queueRepo.findOrCreateByDoctorAndDate(doctorId, today);

    // 4. Check if patient already has active visit today for this doctor
    const existingActive = await this.visitRepo.findActiveVisitByPatient(patientId, today);
    if (existingActive && existingActive.doctorId === doctorId && existingActive.status === 'WAITING') {
      const summary = await this.recalculateQueue(queue.id);
      return { visit: existingActive, summary };
    }

    // 5. Create Visit
    const visitCode = `VISIT-${today.replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
    const priorityLevel = dto.priorityLevel ?? 0;

    const visit = await this.visitRepo.create(
      {
        patientId,
        doctorId,
        queueId: queue.id,
        appointmentId: appointmentId || null,
        priorityLevel,
        status: 'WAITING',
        checkInTime: new Date(),
        notes: dto.notes || null,
      },
      visitCode
    );

    // 6. Generate Token
    const tokenDisplay = await this.generateToken(doctorId, today, visit.id);

    // 7. Audit Log
    await this.auditService.log({
      actorId: dto.actor.id,
      actorName: dto.actor.name,
      actorRole: dto.actor.role,
      action: 'PATIENT_CHECKED_IN',
      entity: 'Visit',
      entityId: visit.id,
      afterState: { visitId: visit.id, tokenDisplay, status: 'WAITING', priorityLevel },
      reason: appointmentId ? 'Appointment Check-in' : 'Walk-in Registration',
    });

    // 8. Notifications
    await this.notificationService.dispatch({
      recipientType: 'PATIENT',
      patientId: patient.id,
      userId: patient.userId,
      patientPhone: patient.phone,
      title: 'Check-In Successful',
      message: `Your token is ${tokenDisplay} for ${doctor.name} (${doctor.roomNumber}).`,
      channel: 'IN_APP',
      eventType: 'TOKEN_GENERATED',
      metadata: { tokenDisplay, doctorName: doctor.name, roomNumber: doctor.roomNumber },
    });

    // 9. Recalculate Queue & Broadcast
    const summary = await this.recalculateQueue(queue.id);

    return { visit, summary };
  }

  /**
   * Call Next Patient in queue
   */
  async callNextPatient(
    doctorId: string,
    actor: { id?: string; name: string; role: string }
  ): Promise<{ calledVisit: FullVisitDetails | null; summary: QueueStateSummary }> {
    const today = this.getTodayDateStr();
    const queue = await this.queueRepo.findOrCreateByDoctorAndDate(doctorId, today);
    const doctor = await this.doctorRepo.findById(doctorId);
    if (!doctor) throw new Error(`Doctor ${doctorId} not found`);

    const allVisits = await this.visitRepo.findByQueueId(queue.id);

    // Check if there is currently a CALLED visit not yet in consultation
    const currentlyCalled = allVisits.find((v) => v.status === 'CALLED');
    if (currentlyCalled) {
      // Auto-transition to IN_CONSULTATION or mark ready
      await this.visitRepo.updateStatus(currentlyCalled.id, 'IN_CONSULTATION', {
        consultationStartTime: new Date(),
      });
    }

    // Filter next eligible waiting patient (Emergency > Priority > Normal, ordered by check-in time)
    const waitingVisits = allVisits.filter(
      (v) => v.status === 'WAITING' || v.status === 'CHECKED_IN'
    );

    waitingVisits.sort((a, b) => {
      if (b.priorityLevel !== a.priorityLevel) return b.priorityLevel - a.priorityLevel;
      const timeA = a.checkInTime ? new Date(a.checkInTime).getTime() : new Date(a.createdAt).getTime();
      const timeB = b.checkInTime ? new Date(b.checkInTime).getTime() : new Date(b.createdAt).getTime();
      return timeA - timeB;
    });

    if (waitingVisits.length === 0) {
      const summary = await this.recalculateQueue(queue.id);
      return { calledVisit: null, summary };
    }

    const nextVisit = waitingVisits[0];
    QueueStateMachine.validateTransition(nextVisit.status, 'CALLED');

    const updatedVisit = await this.visitRepo.updateStatus(nextVisit.id, 'CALLED', {
      calledTime: new Date(),
    });

    // Doctor becomes busy
    await this.doctorRepo.updateStatus(doctorId, 'BUSY', doctor.currentDelayMinutes);

    // Audit Log
    await this.auditService.log({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'PATIENT_CALLED',
      entity: 'Visit',
      entityId: nextVisit.id,
      beforeState: { status: nextVisit.status },
      afterState: { status: 'CALLED', calledTime: new Date().toISOString() },
      reason: `Called by ${doctor.name}`,
    });

    // Notification to called patient
    const tokenDisplay = updatedVisit.token?.tokenDisplay || 'Your Token';
    await this.notificationService.dispatch({
      recipientType: 'PATIENT',
      patientId: updatedVisit.patientId,
      userId: updatedVisit.patient.userId,
      patientPhone: updatedVisit.patient.phone,
      title: "It's Your Turn!",
      message: `Token ${tokenDisplay}: Please proceed to ${doctor.roomNumber} for consultation with ${doctor.name}.`,
      channel: 'IN_APP',
      eventType: 'PATIENT_CALLED',
      metadata: { roomNumber: doctor.roomNumber, doctorName: doctor.name, tokenDisplay },
    });

    // Notify next 2 waiting patients to Get Ready
    const remainingWaiting = waitingVisits.slice(1, 3);
    for (const upcoming of remainingWaiting) {
      await this.notificationService.dispatch({
        recipientType: 'PATIENT',
        patientId: upcoming.patientId,
        userId: upcoming.patient.userId,
        patientPhone: upcoming.patient.phone,
        title: 'Please Get Ready',
        message: `Token ${upcoming.token?.tokenDisplay}: You are next in line for ${doctor.name}. Please head towards ${doctor.roomNumber}.`,
        channel: 'IN_APP',
        eventType: 'GET_READY',
      });
    }

    // Emit specialized patient called event
    socketEmitter.emitPatientCalled({
      queueId: queue.id,
      doctorId,
      visitId: updatedVisit.id,
      tokenDisplay,
      roomNumber: doctor.roomNumber,
      patientId: updatedVisit.patientId,
    });

    const summary = await this.recalculateQueue(queue.id);
    return { calledVisit: updatedVisit, summary };
  }

  /**
   * Start consultation
   */
  async startConsultation(
    visitId: string,
    actor: { id?: string; name: string; role: string }
  ): Promise<QueueStateSummary> {
    const visit = await this.visitRepo.findById(visitId);
    if (!visit) throw new Error(`Visit ${visitId} not found`);

    QueueStateMachine.validateTransition(visit.status, 'IN_CONSULTATION');

    await this.visitRepo.updateStatus(visitId, 'IN_CONSULTATION', {
      consultationStartTime: new Date(),
    });

    await this.doctorRepo.updateStatus(visit.doctorId, 'BUSY');

    await this.auditService.log({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'CONSULTATION_STARTED',
      entity: 'Visit',
      entityId: visitId,
      beforeState: { status: visit.status },
      afterState: { status: 'IN_CONSULTATION' },
    });

    return this.recalculateQueue(visit.queueId);
  }

  /**
   * Complete Consultation
   */
  async completeConsultation(
    visitId: string,
    dto: CompleteConsultationDTO
  ): Promise<{ visit: FullVisitDetails; summary: QueueStateSummary }> {
    const visit = await this.visitRepo.findById(visitId);
    if (!visit) throw new Error(`Visit ${visitId} not found`);

    QueueStateMachine.validateTransition(visit.status, 'COMPLETED');

    const completed = await this.visitRepo.updateStatus(visitId, 'COMPLETED', {
      consultationEndTime: new Date(),
    });

    if (visit.appointmentId) {
      await this.appointmentRepo.updateStatus(visit.appointmentId, 'COMPLETED');
    }

    // Set doctor status back to AVAILABLE
    await this.doctorRepo.updateStatus(visit.doctorId, 'AVAILABLE');

    // Audit Log
    await this.auditService.log({
      actorId: dto.actor.id,
      actorName: dto.actor.name,
      actorRole: dto.actor.role,
      action: 'PATIENT_COMPLETED',
      entity: 'Visit',
      entityId: visitId,
      beforeState: { status: visit.status },
      afterState: { status: 'COMPLETED' },
      metadata: { notes: dto.notes },
    });

    // Patient Notification
    await this.notificationService.dispatch({
      recipientType: 'PATIENT',
      patientId: visit.patientId,
      userId: visit.patient.userId,
      title: 'Consultation Completed',
      message: `Your visit with Dr. ${visit.doctor.name} has concluded. Thank you for visiting CareFlow Health.`,
      channel: 'IN_APP',
      eventType: 'CONSULTATION_COMPLETED',
    });

    const summary = await this.recalculateQueue(visit.queueId);
    return { visit: completed, summary };
  }

  /**
   * Mark Patient No-Show
   */
  async markNoShow(
    visitId: string,
    reason = 'Patient did not respond to calls',
    actor: { id?: string; name: string; role: string }
  ): Promise<QueueStateSummary> {
    const visit = await this.visitRepo.findById(visitId);
    if (!visit) throw new Error(`Visit ${visitId} not found`);

    QueueStateMachine.validateTransition(visit.status, 'NO_SHOW');

    await this.visitRepo.updateStatus(visitId, 'NO_SHOW');

    if (visit.appointmentId) {
      await this.appointmentRepo.updateStatus(visit.appointmentId, 'NO_SHOW');
    }

    await this.auditService.log({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'PATIENT_NO_SHOW',
      entity: 'Visit',
      entityId: visitId,
      beforeState: { status: visit.status },
      afterState: { status: 'NO_SHOW' },
      reason,
    });

    await this.notificationService.dispatch({
      recipientType: 'PATIENT',
      patientId: visit.patientId,
      userId: visit.patient.userId,
      patientPhone: visit.patient.phone,
      title: 'Missed Call / No-Show',
      message: `Your token ${visit.token?.tokenDisplay} was called but you were not present. Please contact reception to rejoin the queue.`,
      channel: 'IN_APP',
      eventType: 'PATIENT_NO_SHOW',
    });

    return this.recalculateQueue(visit.queueId);
  }

  /**
   * Cancel Visit
   */
  async cancelVisit(
    visitId: string,
    reason: string,
    actor: { id?: string; name: string; role: string }
  ): Promise<QueueStateSummary> {
    const visit = await this.visitRepo.findById(visitId);
    if (!visit) throw new Error(`Visit ${visitId} not found`);

    QueueStateMachine.validateTransition(visit.status, 'CANCELLED');

    await this.visitRepo.updateStatus(visitId, 'CANCELLED');

    if (visit.appointmentId) {
      await this.appointmentRepo.updateStatus(visit.appointmentId, 'CANCELLED');
    }

    await this.auditService.log({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'PATIENT_CANCELLED',
      entity: 'Visit',
      entityId: visitId,
      beforeState: { status: visit.status },
      afterState: { status: 'CANCELLED' },
      reason,
    });

    return this.recalculateQueue(visit.queueId);
  }

  /**
   * Emergency / Priority Insertion with Impact Calculation
   */
  async insertPriorityPatient(
    dto: CheckInDTO & { priorityLevel: PriorityLevel; reason: string }
  ): Promise<{ visit: FullVisitDetails; summary: QueueStateSummary; impactedPatientsCount: number }> {
    const result = await this.checkInPatient({
      ...dto,
      priorityLevel: dto.priorityLevel,
    });

    const waitingItems = result.summary.items;
    const insertedPosition = waitingItems.findIndex((i) => i.visitId === result.visit.id) + 1;
    const impactedPatientsCount = Math.max(0, waitingItems.length - insertedPosition);

    await this.auditService.log({
      actorId: dto.actor.id,
      actorName: dto.actor.name,
      actorRole: dto.actor.role,
      action: 'EMERGENCY_INSERTED',
      entity: 'Visit',
      entityId: result.visit.id,
      afterState: {
        priorityLevel: dto.priorityLevel,
        token: result.visit.token?.tokenDisplay,
        impactedPatientsCount,
      },
      reason: dto.reason || 'Emergency patient fast-track triage',
    });

    return {
      visit: result.visit,
      summary: result.summary,
      impactedPatientsCount,
    };
  }

  /**
   * Preview Emergency Insertion Impact without committing
   */
  async previewEmergencyImpact(doctorId: string): Promise<{
    currentWaitingCount: number;
    estimatedAdditionalDelayMinutes: number;
    impactedPatientsCount: number;
  }> {
    const today = this.getTodayDateStr();
    const queue = await this.queueRepo.findByDoctorAndDate(doctorId, today);
    if (!queue) {
      return { currentWaitingCount: 0, estimatedAdditionalDelayMinutes: 0, impactedPatientsCount: 0 };
    }
    const doctor = await this.doctorRepo.findById(doctorId);
    const avgDuration = doctor?.avgConsultationDuration || 15;
    const visits = await this.visitRepo.findByQueueId(queue.id);
    const waitingCount = visits.filter((v) => v.status === 'WAITING' || v.status === 'CHECKED_IN').length;

    return {
      currentWaitingCount: waitingCount,
      estimatedAdditionalDelayMinutes: avgDuration,
      impactedPatientsCount: waitingCount,
    };
  }

  /**
   * Apply Doctor Delay
   */
  async applyDoctorDelay(
    doctorId: string,
    delayMinutes: number,
    reason: string,
    actor: { id?: string; name: string; role: string }
  ): Promise<QueueStateSummary> {
    const doctor = await this.doctorRepo.updateDelay(doctorId, delayMinutes, reason);

    const today = this.getTodayDateStr();
    const queue = await this.queueRepo.findOrCreateByDoctorAndDate(doctorId, today);

    // Audit Log
    await this.auditService.log({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'DOCTOR_DELAY_UPDATED',
      entity: 'Doctor',
      entityId: doctorId,
      afterState: { currentDelayMinutes: delayMinutes, delayReason: reason },
      reason,
    });

    // Notify affected waiting patients
    const visits = await this.visitRepo.findByQueueId(queue.id);
    const waiting = visits.filter((v) => v.status === 'WAITING' || v.status === 'CHECKED_IN');
    for (const v of waiting) {
      await this.notificationService.dispatch({
        recipientType: 'PATIENT',
        patientId: v.patientId,
        userId: v.patient.userId,
        patientPhone: v.patient.phone,
        title: `Doctor Delay Notice`,
        message: `${doctor.name} is delayed by approx ${delayMinutes} minutes (${reason}). Your ETA has been adjusted.`,
        channel: 'IN_APP',
        eventType: 'DOCTOR_DELAY',
      });
    }

    socketEmitter.emitDoctorDelay({
      doctorId,
      doctorName: doctor.name,
      delayMinutes,
      reason,
    });

    return this.recalculateQueue(queue.id);
  }

  /**
   * Pause / Resume Doctor Queue
   */
  async pauseDoctorQueue(
    doctorId: string,
    reason: string,
    actor: { id?: string; name: string; role: string }
  ): Promise<QueueStateSummary> {
    await this.doctorRepo.updateStatus(doctorId, 'ON_BREAK', 0, reason);

    const today = this.getTodayDateStr();
    const queue = await this.queueRepo.findOrCreateByDoctorAndDate(doctorId, today);
    await this.queueRepo.updateStatus(queue.id, 'PAUSED');

    await this.auditService.log({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'DOCTOR_PAUSED_QUEUE',
      entity: 'Queue',
      entityId: queue.id,
      reason,
    });

    socketEmitter.emitDoctorStatusChanged({
      doctorId,
      status: 'ON_BREAK',
      currentDelayMinutes: 0,
    });

    return this.recalculateQueue(queue.id);
  }

  async resumeDoctorQueue(
    doctorId: string,
    actor: { id?: string; name: string; role: string }
  ): Promise<QueueStateSummary> {
    await this.doctorRepo.updateStatus(doctorId, 'AVAILABLE', 0, null);

    const today = this.getTodayDateStr();
    const queue = await this.queueRepo.findOrCreateByDoctorAndDate(doctorId, today);
    await this.queueRepo.updateStatus(queue.id, 'ACTIVE');

    await this.auditService.log({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'DOCTOR_RESUMED_QUEUE',
      entity: 'Queue',
      entityId: queue.id,
      reason: 'Doctor returned to active consultation',
    });

    socketEmitter.emitDoctorStatusChanged({
      doctorId,
      status: 'AVAILABLE',
      currentDelayMinutes: 0,
    });

    return this.recalculateQueue(queue.id);
  }

  /**
   * Reassign Single Patient to Another Doctor
   */
  async reassignPatient(
    visitId: string,
    targetDoctorId: string,
    reason: string,
    actor: { id?: string; name: string; role: string }
  ): Promise<{ visit: FullVisitDetails; oldQueueSummary: QueueStateSummary; newQueueSummary: QueueStateSummary }> {
    const visit = await this.visitRepo.findById(visitId);
    if (!visit) throw new Error(`Visit ${visitId} not found`);

    const oldDoctorId = visit.doctorId;
    const oldQueueId = visit.queueId;
    const today = this.getTodayDateStr();

    const newDoctor = await this.doctorRepo.findById(targetDoctorId);
    if (!newDoctor) throw new Error(`Target doctor ${targetDoctorId} not found`);

    const newQueue = await this.queueRepo.findOrCreateByDoctorAndDate(targetDoctorId, today);

    // Reassign visit
    const updatedVisit = await this.visitRepo.reassignDoctor(visitId, targetDoctorId, newQueue.id, reason);

    // Audit Log
    await this.auditService.log({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'DOCTOR_REASSIGNED',
      entity: 'Visit',
      entityId: visitId,
      beforeState: { doctorId: oldDoctorId, queueId: oldQueueId },
      afterState: { doctorId: targetDoctorId, queueId: newQueue.id },
      reason,
    });

    // Notify patient
    await this.notificationService.dispatch({
      recipientType: 'PATIENT',
      patientId: visit.patientId,
      userId: visit.patient.userId,
      patientPhone: visit.patient.phone,
      title: 'Doctor Reassigned',
      message: `Your visit has been reassigned to ${newDoctor.name} (${newDoctor.roomNumber}). Reason: ${reason}. Your queue position has been updated.`,
      channel: 'IN_APP',
      eventType: 'DOCTOR_REASSIGNED',
    });

    const oldQueueSummary = await this.recalculateQueue(oldQueueId);
    const newQueueSummary = await this.recalculateQueue(newQueue.id);

    return { visit: updatedVisit, oldQueueSummary, newQueueSummary };
  }

  /**
   * Reassign Entire Queue (e.g. Doctor Emergency / Out of Office)
   */
  async reassignQueue(
    fromDoctorId: string,
    toDoctorId: string,
    reason: string,
    actor: { id?: string; name: string; role: string }
  ): Promise<{ transferredCount: number; newQueueSummary: QueueStateSummary }> {
    const today = this.getTodayDateStr();
    const sourceQueue = await this.queueRepo.findByDoctorAndDate(fromDoctorId, today);
    if (!sourceQueue) {
      throw new Error(`No active queue found for source doctor ${fromDoctorId} today`);
    }

    const targetDoctor = await this.doctorRepo.findById(toDoctorId);
    if (!targetDoctor) throw new Error(`Target doctor ${toDoctorId} not found`);

    const targetQueue = await this.queueRepo.findOrCreateByDoctorAndDate(toDoctorId, today);

    const sourceVisits = await this.visitRepo.findByQueueId(sourceQueue.id);
    const waitingVisits = sourceVisits.filter(
      (v) => v.status === 'WAITING' || v.status === 'CHECKED_IN' || v.status === 'BOOKED'
    );

    let transferredCount = 0;
    for (const v of waitingVisits) {
      await this.visitRepo.reassignDoctor(v.id, toDoctorId, targetQueue.id, reason);
      transferredCount++;

      await this.notificationService.dispatch({
        recipientType: 'PATIENT',
        patientId: v.patientId,
        userId: v.patient.userId,
        patientPhone: v.patient.phone,
        title: 'Queue Transferred',
        message: `Dr. ${v.doctor.name} is currently unavailable. Your queue visit has been transferred to ${targetDoctor.name} (${targetDoctor.roomNumber}).`,
        channel: 'IN_APP',
        eventType: 'QUEUE_TRANSFERRED',
      });
    }

    // Set source doctor to OFFLINE
    await this.doctorRepo.updateStatus(fromDoctorId, 'OFFLINE', 0, reason);
    await this.queueRepo.updateStatus(sourceQueue.id, 'CLOSED');

    await this.auditService.log({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'QUEUE_MERGED',
      entity: 'Queue',
      entityId: sourceQueue.id,
      afterState: { targetQueueId: targetQueue.id, targetDoctorId: toDoctorId, transferredCount },
      reason,
    });

    await this.recalculateQueue(sourceQueue.id);
    const newQueueSummary = await this.recalculateQueue(targetQueue.id);

    return { transferredCount, newQueueSummary };
  }

  /**
   * Get Queue State by Doctor & Date
   */
  async getQueueState(doctorId: string, dateStr?: string): Promise<QueueStateSummary> {
    const date = dateStr || this.getTodayDateStr();
    const queue = await this.queueRepo.findOrCreateByDoctorAndDate(doctorId, date);
    return this.recalculateQueue(queue.id);
  }

  /**
   * Get Individual Patient Queue View
   */
  async getPatientQueueView(visitId: string): Promise<PatientQueueView> {
    const visit = await this.visitRepo.findById(visitId);
    if (!visit) throw new Error(`Visit ${visitId} not found`);

    const summary = await this.recalculateQueue(visit.queueId);
    const matchedItem = summary.items.find((i) => i.visitId === visitId);

    const isCurrentlyCalled = summary.currentlyCalling?.visitId === visitId;
    const isCurrentlyInConsultation = summary.inConsultation?.visitId === visitId;

    const position = matchedItem ? matchedItem.position : (isCurrentlyCalled || isCurrentlyInConsultation ? 0 : 0);
    const patientsAhead = matchedItem ? matchedItem.patientsAhead : 0;
    const estimatedWait = matchedItem ? matchedItem.estimatedWaitMinutes : 0;

    const travel = visit.patient.travelPreference?.travelTimeMinutes ?? 25;
    const buffer = visit.patient.travelPreference?.safetyBufferMinutes ?? 10;

    return {
      visitId: visit.id,
      visitCode: visit.visitCode,
      tokenDisplay: visit.token?.tokenDisplay || `T-${visit.visitCode.slice(-4)}`,
      tokenNumber: visit.token?.tokenNumber || 0,
      status: visit.status,
      doctorName: summary.doctorName,
      specialization: summary.specialization,
      roomNumber: summary.roomNumber,
      departmentName: summary.specialization,
      position,
      patientsAhead,
      estimatedWaitMinutes: estimatedWait,
      estimatedConsultationTime: matchedItem?.estimatedConsultationTime || new Date().toISOString(),
      smartLeaveHomeTime: matchedItem?.smartLeaveHomeTime || new Date().toISOString(),
      travelTimeMinutes: travel,
      safetyBufferMinutes: buffer,
      doctorStatus: summary.doctorStatus,
      currentDelayMinutes: summary.currentDelayMinutes,
      delayReason: summary.delayReason,
      checkInTime: visit.checkInTime ? new Date(visit.checkInTime).toISOString() : null,
      queueProgressPercent: summary.totalTokens > 0
        ? Math.min(100, Math.max(0, Math.round(((summary.totalTokens - position) / summary.totalTokens) * 100)))
        : 100,
    };
  }
}
