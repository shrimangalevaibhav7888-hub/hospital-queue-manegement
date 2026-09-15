import { Server } from 'socket.io';
import { QueueStateSummary, PatientQueueView, PublicQueueItem } from '../types/queue';
import { NotificationEventPayload } from '../types/events';
import { SOCKET_EVENTS } from '../config/constants';
import { logger } from '../utils/logger';

class SocketEmitter {
  private io: Server | null = null;

  setIO(io: Server) {
    this.io = io;
  }

  emitQueueUpdated(summary: QueueStateSummary) {
    if (!this.io) return;

    logger.debug(`[Socket] Broadcasting queue update for doctor ${summary.doctorId} (Queue: ${summary.queueId})`);

    // 1. Send full queue state to doctor room & admin monitor
    this.io.to(`doctor:${summary.doctorId}`).emit(SOCKET_EVENTS.QUEUE_UPDATED, summary);
    this.io.to(`queue:${summary.queueId}`).emit(SOCKET_EVENTS.QUEUE_UPDATED, summary);
    this.io.to('admin:monitoring').emit(SOCKET_EVENTS.QUEUE_UPDATED, summary);

    // 2. Send privacy-filtered patient-specific view to each patient room
    for (const item of summary.items) {
      const patientView: PatientQueueView = {
        visitId: item.visitId,
        visitCode: item.visitCode,
        tokenDisplay: item.tokenDisplay,
        tokenNumber: item.tokenNumber,
        status: item.status,
        doctorName: summary.doctorName,
        specialization: summary.specialization,
        roomNumber: summary.roomNumber,
        departmentName: summary.specialization,
        position: item.position,
        patientsAhead: item.patientsAhead,
        estimatedWaitMinutes: item.estimatedWaitMinutes,
        estimatedConsultationTime: item.estimatedConsultationTime,
        smartLeaveHomeTime: item.smartLeaveHomeTime,
        travelTimeMinutes: item.travelTimeMinutes,
        safetyBufferMinutes: item.safetyBufferMinutes,
        doctorStatus: summary.doctorStatus,
        currentDelayMinutes: summary.currentDelayMinutes,
        delayReason: summary.delayReason,
        checkInTime: item.checkInTime ? new Date(item.checkInTime).toISOString() : null,
        queueProgressPercent: summary.totalTokens > 0
          ? Math.min(100, Math.round(((summary.totalTokens - item.position) / summary.totalTokens) * 100))
          : 0,
      };

      this.io.to(`patient:${item.patientId}`).emit(SOCKET_EVENTS.QUEUE_UPDATED, patientView);
    }

    // 3. Send privacy-safe public board updates
    const publicItems: PublicQueueItem[] = summary.items.map((item) => ({
      tokenDisplay: item.tokenDisplay,
      position: item.position,
      status: item.status,
      roomNumber: summary.roomNumber,
      doctorName: summary.doctorName,
      departmentName: summary.specialization,
      estimatedWaitMinutes: item.estimatedWaitMinutes,
    }));

    this.io.to('hospital:public').emit(SOCKET_EVENTS.QUEUE_UPDATED, {
      doctorId: summary.doctorId,
      doctorName: summary.doctorName,
      roomNumber: summary.roomNumber,
      currentNumber: summary.currentNumber,
      doctorStatus: summary.doctorStatus,
      currentDelayMinutes: summary.currentDelayMinutes,
      items: publicItems,
    });
  }

  emitPatientCalled(payload: {
    queueId: string;
    doctorId: string;
    visitId: string;
    tokenDisplay: string;
    roomNumber: string;
    patientId: string;
  }) {
    if (!this.io) return;
    this.io.to(`patient:${payload.patientId}`).emit(SOCKET_EVENTS.PATIENT_CALLED, payload);
    this.io.to(`doctor:${payload.doctorId}`).emit(SOCKET_EVENTS.PATIENT_CALLED, payload);
    this.io.to('hospital:public').emit(SOCKET_EVENTS.PATIENT_CALLED, payload);
  }

  emitDoctorDelay(payload: {
    doctorId: string;
    doctorName: string;
    delayMinutes: number;
    reason: string;
  }) {
    if (!this.io) return;
    this.io.to(`doctor:${payload.doctorId}`).emit(SOCKET_EVENTS.DOCTOR_DELAY_UPDATED, payload);
    this.io.to('admin:monitoring').emit(SOCKET_EVENTS.DOCTOR_DELAY_UPDATED, payload);
  }

  emitDoctorStatusChanged(payload: {
    doctorId: string;
    status: string;
    currentDelayMinutes: number;
  }) {
    if (!this.io) return;
    this.io.to(`doctor:${payload.doctorId}`).emit(SOCKET_EVENTS.DOCTOR_STATUS_CHANGED, payload);
    this.io.to('admin:monitoring').emit(SOCKET_EVENTS.DOCTOR_STATUS_CHANGED, payload);
  }

  emitNotification(payload: NotificationEventPayload) {
    if (!this.io) return;
    if (payload.patientId) {
      this.io.to(`patient:${payload.patientId}`).emit(SOCKET_EVENTS.NOTIFICATION_CREATED, payload);
    }
    if (payload.userId) {
      this.io.to(`user:${payload.userId}`).emit(SOCKET_EVENTS.NOTIFICATION_CREATED, payload);
    }
  }
}

export const socketEmitter = new SocketEmitter();
