import { subMinutes } from 'date-fns';

export interface SmartArrivalInput {
  estimatedConsultationTime: Date;
  travelTimeMinutes?: number;
  safetyBufferMinutes?: number;
  currentTime?: Date;
}

export interface SmartArrivalOutput {
  smartLeaveHomeTime: Date;
  travelTimeMinutes: number;
  safetyBufferMinutes: number;
  urgencyStatus: 'ON_TRACK' | 'PREPARE' | 'LEAVE_NOW' | 'OVERDUE';
  minutesUntilLeave: number;
}

export class SmartArrivalService {
  /**
   * Calculates dynamic leave-home recommendation
   */
  static calculate(input: SmartArrivalInput): SmartArrivalOutput {
    const currentTime = input.currentTime || new Date();
    const travelTime = Math.max(1, input.travelTimeMinutes ?? 25);
    const safetyBuffer = Math.max(0, input.safetyBufferMinutes ?? 10);

    const totalSubtractedMinutes = travelTime + safetyBuffer;
    const smartLeaveHomeTime = subMinutes(input.estimatedConsultationTime, totalSubtractedMinutes);

    const minutesUntilLeave = Math.round(
      (smartLeaveHomeTime.getTime() - currentTime.getTime()) / (1000 * 60)
    );

    let urgencyStatus: 'ON_TRACK' | 'PREPARE' | 'LEAVE_NOW' | 'OVERDUE' = 'ON_TRACK';
    if (minutesUntilLeave < -10) {
      urgencyStatus = 'OVERDUE';
    } else if (minutesUntilLeave <= 0) {
      urgencyStatus = 'LEAVE_NOW';
    } else if (minutesUntilLeave <= 15) {
      urgencyStatus = 'PREPARE';
    }

    return {
      smartLeaveHomeTime,
      travelTimeMinutes: travelTime,
      safetyBufferMinutes: safetyBuffer,
      urgencyStatus,
      minutesUntilLeave,
    };
  }
}
