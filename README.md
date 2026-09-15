# CraftVerse Health — Hospital Patient Queue Management & Smart Arrival System

CraftVerse Health is an intelligent, full-stack, real-time Hospital Patient Queue Management & Smart Arrival application designed to eliminate waiting room crowding, dynamic doctor delay confusion, and arrival uncertainty.

Every feature follows the strict **UI → API → Service → Repository → Database → WebSocket → UI** golden pipeline.

---

## 🌟 Key Features

### 👤 Patient Portal
- **Live Queue Token Card**: Shows Doctor name, room number, current queue position, patients ahead, dynamic ETA, and smart leave-home time.
- **Smart Arrival Advisor**: Calculates recommended departure time (`ETA - Travel Time - Safety Buffer`) with dynamic travel preference customization.
- **Visual Progress Timeline**: Step-by-step indicator tracking `Booked` → `Checked In` → `In Queue` → `Called` → `In Consultation` → `Completed`.
- **Online Self Check-In & Appointment Booking**: Instant token generation for today or scheduled slot booking for future dates.
- **Smart Alerts**: Real-time notifications for delay announcements, queue position updates, "Please Get Ready", and "It's Your Turn".

### 🩺 Doctor Clinic Dashboard
- **Live Queue Table**: Real-time waiting list ordered deterministically by emergency status, priority, and check-in time.
- **Active Patient Banner**: Prominent callout with live consultation stopwatch timer, and one-click actions:
  - `CALL NEXT PATIENT`
  - `START CONSULTATION`
  - `COMPLETE & PRESCRIBE` (diagnosis, treatment plan, clinical notes)
  - `NO SHOW`
- **Clinical Delay Reporter**: Report delay in minutes with clinical reason (e.g. emergency procedure), immediately updating all waiting patients' ETAs.
- **Pause Queue / Break Toggle**: Seamlessly pause and resume clinic queue.

### 🏥 Receptionist & Triage Desk
- **Fast Patient Search & Walk-In Registration**: Search permanent Patient IDs (`PAT-XXXXXX`), register walk-ins, and generate doctor-scoped tokens.
- **Emergency Priority Fast-Track**: Dynamic impact preview calculation (`"5 patients will be moved back, adding +15 min delay"`) before inserting emergency cases at Position #1.
- **Doctor Reassignment & Queue Merge**: Transfer single visits or entire clinic queues to replacement doctors with fair timestamp preservation and automated patient alerts.
- **Multi-Doctor Clinic Matrix**: Real-time grid displaying waiting counts, serving tokens, and delay statuses across all departments.

### 📊 Hospital Executive & Analytics Intelligence
- **Operational KPI Metrics**: Patients served today, current waiting count, average wait time, average consultation duration, no-show rate, and delayed doctors count.
- **Interactive Recharts Visualizations**: Daily throughput trends, busiest clinic hours, wait times per doctor, and outcome distributions.
- **Immutable Queue Audit Trail**: Searchable, filterable audit log recording actor, role, action, entity, before/after states, and clinical reasons.

### 📺 Public Waiting Room TV Board
- **Privacy-by-Design Display**: Displays Token number, Room number, and status without exposing patient personal health identifiers.
- **Audio Chimes**: Automatic two-tone synthesized chimes when tokens are called.

---

## 🏗️ Architecture & Single Source of Truth

```
Hospital Event (Check-in / Call Next / Delay / Emergency / Reassignment)
      ↓
QueueEngineService (Single Source of Truth)
      ↓
Identify Affected Queue(s)
      ↓
Deterministic Priority Ordering (EMERGENCY > PRIORITY > NORMAL, checkInTime ASC)
      ↓
Recalculate Dynamic Positions & Patients Ahead
      ↓
Recalculate Dynamic ETAs (Doctor avg duration + active consultation remainder + delay)
      ↓
Recalculate Smart Arrival (ETA - Travel - Buffer)
      ↓
Persist Changes to Database
      ↓
Create Immutable Audit Record
      ↓
Dispatch Multi-Channel Notifications (In-App, SMS/Push Mocks)
      ↓
Broadcast Real-Time WebSocket Updates (Doctor, Patient, Public TV, Admin rooms)
```

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Socket.IO, Zod, JWT, bcryptjs, Date-fns, Jest, Supertest
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Socket.IO Client, Web Audio API
- **Database**: SQLite (Zero-config local development default) & PostgreSQL (Production / Docker ready)

---

## 👥 Demo Accounts (Pre-Seeded)

All demo accounts use password: `Password123!`

| Role | Email | Name / Specialization | Key Demo View |
|---|---|---|---|
| **Patient** | `patient@craftverse.hospital` | Arthur Pendelton (PAT-100024) | Active Token `DR-S-004`, Smart Arrival Advisor |
| **Doctor** | `dr.sharma@craftverse.hospital` | Dr. Rajesh Sharma (Cardiology) | Delayed clinic queue, Calling, Consultation timer |
| **Doctor** | `dr.patil@craftverse.hospital` | Dr. Ananya Patil (Orthopedics) | Active clinic queue, Room 105 |
| **Receptionist** | `reception@craftverse.hospital` | Marcus Brody (Front Desk) | Walk-In registration, Emergency triage, Transfer |
| **Admin** | `admin@craftverse.hospital` | Eleanor Vance (Director) | Recharts analytics, KPIs, Audit logs |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### 2. Quickstart Installation & Seeding
From the root directory:

```bash
# 1. Install root dependencies
npm install

# 2. Setup & seed the database (SQLite default for zero-config run)
npm run seed
```

### 3. Run Backend & Frontend Locally

```bash
# Terminal 1: Run Backend API & WebSocket Gateway (Port 5000)
npm run dev:backend

# Terminal 2: Run Frontend Web Application (Port 5173)
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing

Run the test suite covering the core Queue Engine, Dynamic ETA calculation, Smart Arrival departure logic, and RBAC authorization:

```bash
npm test
```

### Test Coverage Highlights:
- **Queue State Machine**: Validates state transitions (`BOOKED` → `CHECKED_IN` → `WAITING` → `CALLED` → `IN_CONSULTATION` → `COMPLETED`) and blocks invalid regressions.
- **Deterministic Queue Ordering**: Emergency patients (Priority 2) jump ahead of normal waiting patients.
- **Doctor Token Isolation**: Sequential token numbers scoped per doctor per date.
- **Dynamic ETA Calculation**: Incorporates patients ahead, elapsed consultation times, doctor delays, and break allowances.
- **Smart Arrival Departure**: Verifies `ETA - Travel - Safety Buffer` math and urgency flags (`ON_TRACK`, `PREPARE`, `LEAVE_NOW`).
- **RBAC Security Middleware**: Blocks unauthorized roles from performing restricted operations.

---

## 🐳 Docker PostgreSQL Setup (Optional)

If you prefer running with PostgreSQL in Docker:

```bash
# Start PostgreSQL container
docker compose up -d

# Switch DATABASE_URL in backend/.env:
# DATABASE_URL="postgresql://craftverse:craftverse_secure_password@localhost:5432/craftverse_db?schema=public"

# Push schema and seed
npm --prefix backend run prisma:push
npm run seed
```

---

## 🔌 Future EHR / FHIR Integration Boundary

CraftVerse includes clean integration boundaries:
- `IPatientIdentityProvider`: Ready for FHIR Patient resource synchronization.
- `IAppointmentProvider`: Ready for HL7 / EHR calendar synchronization.
- `IDoctorProvider`: Ready for hospital staff directory synchronization.
- `IHospitalQueueProvider`: Ready for integration with hospital display units and HIS analytics feeds.

---

## 📄 License
ISC © CraftVerse Health Systems.
