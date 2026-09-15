import { VisitStatus } from '../../config/constants';

export class QueueStateError extends Error {
  constructor(message: string, public code = 'INVALID_STATE_TRANSITION') {
    super(message);
    this.name = 'QueueStateError';
  }
}

/**
 * Explicit Finite State Machine for Visit lifecycle
 * Valid paths:
 *   BOOKED -> CHECKED_IN -> WAITING -> CALLED -> IN_CONSULTATION -> COMPLETED
 *   Any non-terminal -> CANCELLED
 *   CALLED | WAITING -> NO_SHOW
 *   WAITING | CALLED -> REASSIGNED / TRANSFERRED
 */
export class QueueStateMachine {
  private static allowedTransitions: Record<VisitStatus, VisitStatus[]> = {
    BOOKED: ['CHECKED_IN', 'WAITING', 'CANCELLED'],
    CHECKED_IN: ['WAITING', 'CALLED', 'CANCELLED'],
    WAITING: ['CALLED', 'IN_CONSULTATION', 'REASSIGNED', 'TRANSFERRED', 'CANCELLED', 'NO_SHOW'],
    CALLED: ['IN_CONSULTATION', 'COMPLETED', 'NO_SHOW', 'WAITING', 'REASSIGNED', 'CANCELLED'],
    IN_CONSULTATION: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: ['WAITING'], // Allowed to be re-instated to waiting if patient arrived late
    REASSIGNED: ['WAITING', 'CALLED'],
    TRANSFERRED: ['WAITING', 'CALLED'],
  };

  static validateTransition(currentStatus: VisitStatus, targetStatus: VisitStatus): boolean {
    if (currentStatus === targetStatus) return true;
    const allowed = this.allowedTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new QueueStateError(
        `Invalid state transition: Cannot transition visit from ${currentStatus} to ${targetStatus}. Allowed: [${allowed.join(', ')}]`
      );
    }
    return true;
  }

  static isTerminalState(status: VisitStatus): boolean {
    return status === 'COMPLETED' || status === 'CANCELLED';
  }

  static isWaitingState(status: VisitStatus): boolean {
    return status === 'WAITING' || status === 'CHECKED_IN';
  }
}
