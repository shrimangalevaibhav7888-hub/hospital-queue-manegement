# CraftVerse REST API & WebSocket Documentation

All endpoints return a standardized JSON envelope:

### Success Format:
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Format:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot transition visit from COMPLETED to WAITING.",
    "details": null
  }
}
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a user account (Patient, Doctor, Receptionist, Admin).

### `POST /api/auth/login`
Authenticates credentials and returns JWT access and refresh tokens.

### `POST /api/auth/refresh`
Refreshes an expired access token.

### `GET /api/auth/me`
*Headers: `Authorization: Bearer <token>`*
Returns current authenticated user profile and associated domain entities.

---

## 2. Queue Engine Endpoints

### `POST /api/queues/check-in`
*Role: PATIENT, RECEPTIONIST, ADMIN*
Performs atomic patient check-in, creates a visit record, generates a sequential doctor-scoped token, recalculates affected positions and ETAs, dispatches notifications, and emits WebSocket updates.

### `GET /api/queues/doctor/:doctorId`
*Public / Authenticated*
Returns full dynamic queue summary for the doctor today, including active call, in-consultation item, and sorted waiting patients.

### `GET /api/queues/patient-active/:patientId`
*Role: PATIENT, RECEPTIONIST*
Returns real-time dynamic queue view for the patient's active visit today.

### `POST /api/queues/doctor/:doctorId/call-next`
*Role: DOCTOR, RECEPTIONIST, ADMIN*
Transitions the next eligible waiting patient to `CALLED`, sets doctor status to `BUSY`, alerts the called patient, notifies the next 2-3 patients to get ready, and broadcasts the event.

### `POST /api/queues/visit/:visitId/start`
*Role: DOCTOR, ADMIN*
Transitions visit from `CALLED` to `IN_CONSULTATION`, recording consultation start timestamp.

### `POST /api/queues/visit/:visitId/complete`
*Role: DOCTOR, ADMIN*
Completes consultation, stores diagnosis/prescription, resets doctor availability, and dispatches completion notifications.

### `POST /api/queues/visit/:visitId/no-show`
*Role: DOCTOR, RECEPTIONIST, ADMIN*
Marks called patient as `NO_SHOW` and advances the queue.

### `POST /api/queues/doctor/delay`
*Role: DOCTOR, RECEPTIONIST, ADMIN*
Applies doctor delay in minutes with a clinical reason, recalculates all affected waiting patients' ETAs and smart departure times, logs audit trail, and sends delay notifications.

### `POST /api/queues/doctor/pause` & `POST /api/queues/doctor/:doctorId/resume`
*Role: DOCTOR, ADMIN*
Toggles doctor clinical break status (`ON_BREAK` / `AVAILABLE`).

### `POST /api/queues/emergency-insert`
*Role: RECEPTIONIST, ADMIN, DOCTOR*
Inserts an emergency triage patient (Priority level 2), placing them at position #1 of the waiting queue and recalculating subsequent ETAs.

### `GET /api/queues/emergency-preview/:doctorId`
Previews the number of impacted waiting patients and estimated additional delay before confirming an emergency fast-track insertion.

### `POST /api/queues/reassign-patient` & `POST /api/queues/reassign-queue`
*Role: RECEPTIONIST, ADMIN*
Transfers single patient or entire queue to a replacement doctor with fair check-in timestamp ordering and audit logging.

### `GET /api/queues/public-overview`
*Public*
Returns privacy-compliant summary of all hospital clinics (Tokens and room numbers only).

---

## 3. Analytics & Audit Endpoints

### `GET /api/analytics/kpis?range=today|7days|30days`
*Role: ADMIN, RECEPTIONIST, DOCTOR*
Returns persisted operational KPIs (patients served, average wait time, average consultation time, no-show rate, cancellation rate, delayed doctors).

### `GET /api/analytics/charts?range=7days|30days`
*Role: ADMIN, RECEPTIONIST*
Returns datasets for Recharts daily throughput, doctor wait times, peak hours volume, and status distributions.

### `GET /api/audit`
*Role: ADMIN, RECEPTIONIST*
Returns searchable and filterable queue audit trail logs.

---

## 4. WebSocket Events (`Socket.IO`)

| Event Name | Direction | Payload Description |
|---|---|---|
| `queue.updated` | Server → Client | Updated `QueueStateSummary` or `PatientQueueView` |
| `queue.patient_called` | Server → Client | Called token, patient ID, and room number |
| `queue.delay_updated` | Server → Client | Doctor delay minutes and clinical reason |
| `doctor.status_changed` | Server → Client | Doctor availability status (`AVAILABLE`, `ON_BREAK`, etc.) |
| `notification.created` | Server → Client | Real-time in-app notification |
