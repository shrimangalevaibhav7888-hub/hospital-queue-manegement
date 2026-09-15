# CraftVerse Golden Queue Engine Architecture

## 1. Single Source of Truth Principle

To prevent race conditions, stale calculations, and inconsistent state transitions across the platform, exactly **ONE** central `QueueEngineService` manages queue recalculations.

No controller, route handler, frontend component, or background job performs direct queue ordering or ETA calculations.

---

## 2. Queue Engine Pipeline

Every queue mutation triggers the authoritative Golden Pipeline:

```
Hospital Event (Check-in / Call Next / Delay / Emergency / Reassign)
      │
      ▼
QueueEngineService
      │
      ▼
Identify Affected Queue(s)
      │
      ▼
Deterministic Priority Sorting (EMERGENCY > PRIORITY > NORMAL, checkInTime ASC)
      │
      ▼
Recalculate Dynamic 1-based Positions & Patients Ahead
      │
      ▼
Recalculate Dynamic ETAs (Doctor avg duration + active consultation remainder + delay)
      │
      ▼
Recalculate Smart Arrival (ETA - Travel - Safety Buffer)
      │
      ▼
Persist Database Changes & Update Doctor State
      │
      ▼
Create Immutable Audit Record (Actor, Action, Before/After State, Reason)
      │
      ▼
Dispatch Targeted Notifications (In-App / Simulated SMS / Push)
      │
      ▼
Broadcast Real-Time WebSocket Updates (Doctor, Patient, Public TV, Admin rooms)
```

---

## 3. Mathematical Models

### 3.1 Dynamic ETA Calculation
$$\text{Wait Time} = \text{Remaining Active Consultation} + (\text{Patients Ahead} \times \text{Avg Doctor Duration}) + \text{Doctor Delay} + \text{Break Allowance}$$

$$\text{Predicted Consultation Time} = \text{Current Time} + \text{Wait Time}$$

Where:
- $\text{Remaining Active Consultation} = \max(0, \text{Avg Duration} - \text{Elapsed Minutes})$
- $\text{Doctor Delay} = \text{Reported Delay in Minutes}$
- $\text{Break Allowance} = 15 \text{ mins if doctor is on break, else } 0$

### 3.2 Smart Leave-Home Time Calculation
$$\text{Smart Leave Home Time} = \text{Predicted Consultation Time} - \text{Estimated Travel Time} - \text{Safety Buffer}$$

Urgency Status triggers:
- `OVERDUE` if $\text{Minutes Until Departure} < -10$
- `LEAVE_NOW` if $\text{Minutes Until Departure} \le 0$
- `PREPARE` if $\text{Minutes Until Departure} \le 15$
- `ON_TRACK` otherwise

---

## 4. Fair Queue Ordering & Emergency Insertion

When an emergency patient arrives (Priority level 2):
1. The emergency patient is placed at **Position #1** of the waiting list.
2. The queue engine recalculates all subsequent patients' positions:
   - Patient A: Pos 1 → Pos 2
   - Patient B: Pos 2 → Pos 3
3. Each impacted patient's ETA is updated by the doctor's average duration ($\approx +15\text{ mins}$).
4. An impact preview endpoint (`GET /api/queues/emergency-preview/:doctorId`) allows staff to see the exact number of impacted patients before confirming insertion.

---

## 5. Doctor Reassignment & Queue Merge

When a doctor becomes unexpectedly unavailable:
1. All waiting visits are transferred to the designated replacement doctor's queue.
2. Merged patients are sorted fairly using their **original check-in timestamp** while preserving priority/emergency levels.
3. Every transferred patient receives an automated SMS and in-app notification with the replacement doctor's name and new room number.
4. An immutable audit record tracks the source doctor, replacement doctor, actor, and clinical reason.
