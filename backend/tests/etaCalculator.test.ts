import { ETACalculator } from '../src/services/queue/ETACalculator';

describe('ETACalculator Unit Tests', () => {
  const baseTime = new Date('2026-09-15T10:00:00.000Z');

  test('calculates correct wait time for 0 patients ahead and 0 delay', () => {
    const result = ETACalculator.calculate({
      patientsAhead: 0,
      avgConsultationDurationMinutes: 15,
      doctorDelayMinutes: 0,
      baseTime,
    });

    expect(result.estimatedWaitMinutes).toBe(0);
    expect(result.estimatedConsultationTime.toISOString()).toBe(baseTime.toISOString());
  });

  test('calculates wait time for 3 patients ahead with 15 min duration', () => {
    const result = ETACalculator.calculate({
      patientsAhead: 3,
      avgConsultationDurationMinutes: 15,
      doctorDelayMinutes: 0,
      baseTime,
    });

    // 3 * 15 = 45 minutes
    expect(result.estimatedWaitMinutes).toBe(45);
    const expectedTime = new Date('2026-09-15T10:45:00.000Z');
    expect(result.estimatedConsultationTime.toISOString()).toBe(expectedTime.toISOString());
  });

  test('incorporates doctor delay into total ETA', () => {
    const result = ETACalculator.calculate({
      patientsAhead: 2,
      avgConsultationDurationMinutes: 15,
      doctorDelayMinutes: 20,
      baseTime,
    });

    // 2 * 15 + 20 = 50 minutes
    expect(result.estimatedWaitMinutes).toBe(50);
  });

  test('considers active consultation elapsed time', () => {
    const startTime = new Date('2026-09-15T09:55:00.000Z'); // 5 minutes ago
    const result = ETACalculator.calculate({
      patientsAhead: 1,
      avgConsultationDurationMinutes: 15,
      doctorDelayMinutes: 0,
      currentConsultationStartTime: startTime,
      baseTime,
    });

    // Current remaining: 15 - 5 = 10 min
    // Patients ahead: 1 * 15 = 15 min
    // Total = 25 min
    expect(result.estimatedWaitMinutes).toBe(25);
  });

  test('adds break allowance if doctor is on break', () => {
    const result = ETACalculator.calculate({
      patientsAhead: 1,
      avgConsultationDurationMinutes: 10,
      doctorDelayMinutes: 0,
      isDoctorOnBreak: true,
      baseTime,
    });

    // 1 * 10 + 15 (break) = 25 minutes
    expect(result.estimatedWaitMinutes).toBe(25);
  });
});
