# 🏥 Hospital Patient Queue Management & Smart Arrival System

An intelligent, real-time hospital patient queue management and smart arrival system designed to reduce patient waiting uncertainty, improve hospital workflow, and provide live queue visibility for patients, doctors, receptionists, and administrators.

The system combines dynamic queue management, real-time updates, ETA calculation, smart leave-home recommendations, doctor delay handling, emergency insertion, notifications, analytics, and role-based access control.

---

## 🚀 Key Features

### 👤 Patient Portal
- Live token display
- Real-time queue position
- Patients-ahead calculation
- Dynamic waiting-time ETA
- Smart Leave-Home Time recommendation
- Online check-in
- Appointment booking
- Travel preferences
- Visit history
- Real-time notification updates

### 👨‍⚕️ Doctor Dashboard
- Today's queue
- Current patient information
- Consultation timer
- CALL NEXT patient
- START consultation
- COMPLETE consultation
- NO SHOW handling
- PAUSE queue
- Report doctor delay
- Real-time queue updates

### 🧑‍💼 Receptionist Desk
- Patient registration
- Patient search
- Walk-in token generation
- Emergency patient insertion
- Emergency impact preview
- Doctor reassignment
- Queue transfer
- Multi-doctor queue monitoring

### 📊 Admin & Analytics
- Hospital KPI metrics
- Patient throughput analytics
- Waiting-time analysis
- Peak-hour analysis
- No-show rate
- Doctor delay frequency
- Audit log monitoring
- Queue configuration

### 📺 Public Queue Board
- Live token display
- Current queue status
- Queue position
- Room information
- Privacy-safe patient display
- No sensitive patient information exposed

---

## ⚡ Smart Queue Engine

All queue-related mutations are controlled through a centralized:

`QueueEngineService`

The Queue Engine is the single source of truth for queue operations.

It provides:

- Atomic token generation
- Priority-based queue ordering
- Emergency > Priority > Normal handling
- Dynamic queue position calculation
- Patients-ahead calculation
- Dynamic ETA calculation
- Doctor delay handling
- Smart Leave-Home Time calculation
- Queue state validation
- Doctor reassignment
- Queue merging
- Audit logging
- Notification triggering
- Real-time Socket.IO events

---

## 🧠 Dynamic ETA Calculation

The system calculates estimated waiting time using factors such as:

- Doctor's average consultation duration
- Current queue position
- Historical consultation trends
- Current consultation progress
- Doctor-reported delays
- Queue priority
- Safety buffers

This allows the system to provide a more meaningful waiting-time estimate instead of relying only on the number of patients in the queue.

---

## 🏠 Smart Leave-Home Feature

The Smart Arrival Engine recommends when a patient should leave home.

Conceptually:

`Recommended Leave Time = Estimated Consultation Time - Travel Time - Safety Buffer`

Travel preferences include:

- Origin
- Travel time
- Transport mode
- Safety buffer

This helps patients avoid arriving unnecessarily early while also reducing the risk of missing their turn.

---

## 🔴 Emergency Patient Handling

Emergency patients can be inserted into the queue with higher priority.

The system can:

1. Insert the emergency patient.
2. Recalculate affected queue positions.
3. Recalculate subsequent ETAs.
4. Display the expected impact.
5. Notify affected users.
6. Record the action in the audit log.

---

## 🔄 Real-Time Queue Updates

The application uses **Socket.IO** for real-time communication.

Example flow:

```text
Doctor calls next patient
        ↓
QueueEngineService
        ↓
Queue state updated
        ↓
Database updated
        ↓
Socket.IO event emitted
        ↓
Patient dashboard receives update
        ↓
ETA / position updated instantly
