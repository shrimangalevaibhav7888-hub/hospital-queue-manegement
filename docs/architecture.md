# CraftVerse Hospital Queue Management & Smart Arrival — Architecture

## 1. System Overview

CraftVerse is a real-time, hospital patient queue management and smart arrival system built with Node.js, Express, TypeScript, Prisma ORM, Socket.IO, and React.

The system addresses critical challenges in healthcare queue dynamics:
- Long physical waiting lounge congestion
- Uncertain appointment arrival times
- Unexpected doctor delays and sudden emergencies
- Information asymmetry between reception, doctors, and patients

---

## 2. Layered Architectural Design

```
[ Frontend Client: React + TypeScript + Tailwind + Socket.IO Client ]
                             │
            REST API & JWT   │   Socket.IO Gateway (Bidirectional Events)
                             ▼
   [ Express API Gateway & RBAC Middleware (/api/...) ]
                             │
                             ▼
  [ Single-Source-of-Truth Core: QueueEngineService ]
         ├── ETACalculator (Stable Dynamic Computation)
         ├── SmartArrivalService (Departure Recommendation)
         └── QueueStateMachine (Strict Lifecycle Transitions)
                             │
                             ▼
    [ EHR-Ready Repository & Provider Boundary Layer ]
         ├── IPatientRepository / IPatientIdentityProvider
         ├── IDoctorRepository / IDoctorProvider
         ├── IVisitRepository / IHospitalQueueProvider
         ├── IQueueRepository
         ├── IAppointmentRepository
         ├── INotificationRepository
         └── IAuditRepository
                             │
                             ▼
       [ Database Layer: Prisma ORM (SQLite / PostgreSQL) ]
```

---

## 3. Core Domain Entity Separation

To prevent domain model collision and maintain strict EHR compatibility, key concepts are decoupled:

1. **Patient ID (`patientCode`)**: Permanent identity (e.g. `PAT-100024`). A patient retains the same ID across visits.
2. **Visit ID (`visitCode`)**: Specific clinical episode / encounter (e.g. `VISIT-20260915-00125`). A patient can have multiple visits.
3. **Queue Token (`tokenDisplay`)**: Ephemeral, doctor-and-date scoped token (e.g. `DR-S-004`). Independent between different doctors and dates.
4. **Queue Position**: Dynamic, recalculated 1-based index in the waiting list. Never stored statically.
5. **Dynamic ETA**: Predicted consultation time based on patients ahead, average doctor duration, elapsed time of active consultation, and clinical delays.
6. **Smart Leave-Home Time**: `Smart Departure = Predicted ETA - Patient Travel Duration - Safety Buffer`.

---

## 4. Role-Based Access Control (RBAC)

The application enforces strict backend RBAC:

| Role | Permissions & Portals |
|---|---|
| **PATIENT** | Book appointments, self check-in, view live token, configure travel preferences, receive smart alerts, cancel own visit. |
| **DOCTOR** | View clinic queue, call next patient, start/complete consultation, mark no-show, pause queue (break), report delay. |
| **RECEPTIONIST** | Search patients, walk-in registration, emergency priority triage, reassign doctors, transfer queues, monitor matrix. |
| **ADMIN** | Executive operational KPI dashboards, Recharts analytics, system configuration, immutable audit trail inspection. |

---

## 5. Real-Time WebSocket Event Topology

The backend utilizes Socket.IO rooms for targeted event propagation and privacy compliance:

- `doctor:<doctorId>`: Receives full clinical queue summaries and patient calling state.
- `patient:<patientId>`: Receives private personalized token positions, ETAs, and smart departure guidance.
- `hospital:public`: Receives privacy-safe board data (Token number + Room number only, patient names stripped).
- `admin:monitoring`: Receives multi-clinic matrix updates, delay alerts, and queue transfers.

### Disconnection & Resiliency
If a WebSocket disconnects, the frontend client displays a non-blocking reconnecting banner and automatically switches to fallback REST polling (every 12 seconds) until the socket reconnects.
