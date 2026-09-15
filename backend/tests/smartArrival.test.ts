import { SmartArrivalService } from '../src/services/queue/SmartArrivalService';

describe('SmartArrivalService Unit Tests', () => {
  const currentTime = new Date('2026-09-15T10:00:00.000Z');

  test('calculates correct leave home time (ETA - travel - buffer)', () => {
    // Expected consultation: 11:40 AM
    const estimatedConsultationTime = new Date('2026-09-15T11:40:00.000Z');
    const travelTimeMinutes = 25;
    const safetyBufferMinutes = 10;

    const result = SmartArrivalService.calculate({
      estimatedConsultationTime,
      travelTimeMinutes,
      safetyBufferMinutes,
      currentTime,
    });

    // 11:40 AM - 35 min = 11:05 AM
    const expectedLeaveTime = new Date('2026-09-15T11:05:00.000Z');
    expect(result.smartLeaveHomeTime.toISOString()).toBe(expectedLeaveTime.toISOString());
    expect(result.minutesUntilLeave).toBe(65); // from 10:00 to 11:05
    expect(result.urgencyStatus).toBe('ON_TRACK');
  });

  test('flags PREPARE when leave time is within 15 minutes', () => {
    const estimatedConsultationTime = new Date('2026-09-15T10:45:00.000Z');
    const travelTimeMinutes = 25;
    const safetyBufferMinutes = 10;

    const result = SmartArrivalService.calculate({
      estimatedConsultationTime,
      travelTimeMinutes,
      safetyBufferMinutes,
      currentTime, // 10:00
    });

    // 10:45 - 35 = 10:10 (10 minutes away)
    expect(result.minutesUntilLeave).toBe(10);
    expect(result.urgencyStatus).toBe('PREPARE');
  });

  test('flags LEAVE_NOW when leave time is immediate', () => {
    const estimatedConsultationTime = new Date('2026-09-15T10:35:00.000Z');
    const travelTimeMinutes = 25;
    const safetyBufferMinutes = 10;

    const result = SmartArrivalService.calculate({
      estimatedConsultationTime,
      travelTimeMinutes,
      safetyBufferMinutes,
      currentTime, // 10:00
    });

    // 10:35 - 35 = 10:00 (0 minutes away)
    expect(result.minutesUntilLeave).toBe(0);
    expect(result.urgencyStatus).toBe('LEAVE_NOW');
  });
});
