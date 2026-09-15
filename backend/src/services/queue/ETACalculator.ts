import { addMinutes } from 'date-fns';

export interface ETACalculationInput {
  patientsAhead: number;
  avgConsultationDurationMinutes: number;
  doctorDelayMinutes: number;
  isDoctorOnBreak?: boolean;
  currentConsultationStartTime?: Date | null;
  baseTime?: Date;
}

export interface ETACalculationOutput {
  estimatedWaitMinutes: number;
  estimatedConsultationTime: Date;
  breakdown: {
    patientsAheadDuration: number;
    doctorDelay: number;
    currentConsultationRemaining: number;
    breakAllowance: number;
  };
}

export class ETACalculator {
  /**
   * Calculates deterministic and stable ETA for a patient in queue
   */
  static calculate(input: ETACalculationInput): ETACalculationOutput {
    const baseTime = input.baseTime || new Date();
    const avgDuration = Math.max(1, input.avgConsultationDurationMinutes || 15);
    const doctorDelay = Math.max(0, input.doctorDelayMinutes || 0);
    const breakAllowance = input.isDoctorOnBreak ? 15 : 0;

    // Remaining time on current active consultation if doctor is currently seeing a patient
    let currentConsultationRemaining = 0;
    if (input.currentConsultationStartTime) {
      const elapsedMinutes = Math.floor(
        (baseTime.getTime() - new Date(input.currentConsultationStartTime).getTime()) / (1000 * 60)
      );
      currentConsultationRemaining = Math.max(0, avgDuration - Math.max(0, elapsedMinutes));
    }

    // Cumulative duration of all waiting patients ahead
    const patientsAheadDuration = Math.max(0, input.patientsAhead) * avgDuration;

    // Total wait time = current consultation remainder + patients ahead duration + doctor delay + break allowance
    const totalWaitMinutes =
      currentConsultationRemaining + patientsAheadDuration + doctorDelay + breakAllowance;

    const estimatedConsultationTime = addMinutes(baseTime, totalWaitMinutes);

    return {
      estimatedWaitMinutes: totalWaitMinutes,
      estimatedConsultationTime,
      breakdown: {
        patientsAheadDuration,
        doctorDelay,
        currentConsultationRemaining,
        breakAllowance,
      },
    };
  }
}
