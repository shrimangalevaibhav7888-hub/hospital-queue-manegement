import { QueueStateMachine, QueueStateError } from '../src/services/queue/QueueStateMachine';
import { ETACalculator } from '../src/services/queue/ETACalculator';
import { SmartArrivalService } from '../src/services/queue/SmartArrivalService';

describe('Queue Engine Core Logic Tests', () => {
  describe('Queue State Machine Transitions', () => {
    test('allows valid progressive transitions', () => {
      expect(QueueStateMachine.validateTransition('BOOKED', 'CHECKED_IN')).toBe(true);
      expect(QueueStateMachine.validateTransition('CHECKED_IN', 'WAITING')).toBe(true);
      expect(QueueStateMachine.validateTransition('WAITING', 'CALLED')).toBe(true);
      expect(QueueStateMachine.validateTransition('CALLED', 'IN_CONSULTATION')).toBe(true);
      expect(QueueStateMachine.validateTransition('IN_CONSULTATION', 'COMPLETED')).toBe(true);
    });

    test('allows cancellation from non-terminal states', () => {
      expect(QueueStateMachine.validateTransition('BOOKED', 'CANCELLED')).toBe(true);
      expect(QueueStateMachine.validateTransition('WAITING', 'CANCELLED')).toBe(true);
      expect(QueueStateMachine.validateTransition('CALLED', 'CANCELLED')).toBe(true);
    });

    test('allows no-show from called or waiting states', () => {
      expect(QueueStateMachine.validateTransition('CALLED', 'NO_SHOW')).toBe(true);
      expect(QueueStateMachine.validateTransition('WAITING', 'NO_SHOW')).toBe(true);
    });

    test('blocks invalid transitions (e.g. COMPLETED -> WAITING)', () => {
      expect(() => QueueStateMachine.validateTransition('COMPLETED', 'WAITING')).toThrow(QueueStateError);
      expect(() => QueueStateMachine.validateTransition('CANCELLED', 'IN_CONSULTATION')).toThrow(QueueStateError);
      expect(() => QueueStateMachine.validateTransition('BOOKED', 'IN_CONSULTATION')).toThrow(QueueStateError);
    });
  });

  describe('Deterministic Queue Ordering Algorithm', () => {
    interface TestItem {
      id: string;
      priority: number; // 0=NORMAL, 1=PRIORITY, 2=EMERGENCY
      checkInTime: Date;
    }

    const sortQueue = (items: TestItem[]) => {
      return [...items].sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return a.checkInTime.getTime() - b.checkInTime.getTime();
      });
    };

    test('orders normal patients by checkInTime ASC', () => {
      const p1: TestItem = { id: 'P1', priority: 0, checkInTime: new Date('2026-09-15T09:00:00Z') };
      const p2: TestItem = { id: 'P2', priority: 0, checkInTime: new Date('2026-09-15T09:10:00Z') };
      const p3: TestItem = { id: 'P3', priority: 0, checkInTime: new Date('2026-09-15T09:20:00Z') };

      const sorted = sortQueue([p3, p1, p2]);
      expect(sorted.map((p) => p.id)).toEqual(['P1', 'P2', 'P3']);
    });

    test('emergency patient (priority 2) jumps ahead of existing waiting patients', () => {
      const pA: TestItem = { id: 'A', priority: 0, checkInTime: new Date('2026-09-15T09:00:00Z') };
      const pB: TestItem = { id: 'B', priority: 0, checkInTime: new Date('2026-09-15T09:05:00Z') };
      const pC: TestItem = { id: 'C', priority: 0, checkInTime: new Date('2026-09-15T09:10:00Z') };

      // Emergency patient E arrives at 09:15
      const pE: TestItem = { id: 'E', priority: 2, checkInTime: new Date('2026-09-15T09:15:00Z') };

      const sorted = sortQueue([pA, pB, pC, pE]);
      expect(sorted.map((p) => p.id)).toEqual(['E', 'A', 'B', 'C']);
    });

    test('priority patient (priority 1) jumps ahead of normal patients but behind emergency patients', () => {
      const pNormal: TestItem = { id: 'Normal', priority: 0, checkInTime: new Date('2026-09-15T09:00:00Z') };
      const pPriority: TestItem = { id: 'Priority', priority: 1, checkInTime: new Date('2026-09-15T09:10:00Z') };
      const pEmergency: TestItem = { id: 'Emergency', priority: 2, checkInTime: new Date('2026-09-15T09:20:00Z') };

      const sorted = sortQueue([pNormal, pPriority, pEmergency]);
      expect(sorted.map((p) => p.id)).toEqual(['Emergency', 'Priority', 'Normal']);
    });
  });

  describe('Token Isolation Per Doctor', () => {
    test('formats doctor token prefix independently', () => {
      const formatToken = (doctorName: string, seq: number) => {
        const initial = doctorName.replace('Dr. ', '').substring(0, 1).toUpperCase();
        return `DR-${initial}-${String(seq).padStart(3, '0')}`;
      };

      const tokenSharma1 = formatToken('Dr. Rajesh Sharma', 1);
      const tokenPatil1 = formatToken('Dr. Ananya Patil', 1);

      expect(tokenSharma1).toBe('DR-R-001');
      expect(tokenPatil1).toBe('DR-A-001');
      // Tokens are distinct even with same sequence number
      expect(tokenSharma1).not.toBe(tokenPatil1);
    });
  });
});
