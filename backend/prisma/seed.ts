import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { format, subDays, addMinutes, subMinutes } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting CareFlow Hospital Database Seeding...');

  // 1. Clean existing records in correct relation order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.doctorDelay.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.token.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.queue.deleteMany();
  await prisma.travelPreference.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.queueConfiguration.deleteMany();

  console.log('Cleaned existing records.');

  // 2. Create Hospital Queue Configuration
  await prisma.queueConfiguration.create({
    data: {
      hospitalName: 'CareFlow Apex Multispecialty Hospital',
      defaultConsultationMinutes: 15,
      defaultSafetyBufferMinutes: 10,
      defaultTravelTimeMinutes: 25,
      emergencyPriorityBonus: 2,
      allowOnlineCheckInHours: 2,
    },
  });

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  // 3. Create Departments
  const cardiology = await prisma.department.create({
    data: {
      code: 'CARD',
      name: 'Cardiology',
      description: 'Comprehensive adult and pediatric cardiac care',
      location: 'Building A, 2nd Floor',
    },
  });

  const orthopedics = await prisma.department.create({
    data: {
      code: 'ORTHO',
      name: 'Orthopedics',
      description: 'Bone, joint, spine and sports trauma center',
      location: 'Building B, 1st Floor',
    },
  });

  const pediatrics = await prisma.department.create({
    data: {
      code: 'PEDS',
      name: 'Pediatrics',
      description: 'Infant, child, and adolescent healthcare',
      location: 'Building A, 3rd Floor',
    },
  });

  const generalMed = await prisma.department.create({
    data: {
      code: 'GENMED',
      name: 'General Medicine',
      description: 'Primary internal medicine & preventive care',
      location: 'Building A, 1st Floor',
    },
  });

  const neurology = await prisma.department.create({
    data: {
      code: 'NEURO',
      name: 'Neurology',
      description: 'Brain, nervous system, and stroke clinic',
      location: 'Building B, 3rd Floor',
    },
  });

  console.log('Created 5 Departments.');

  // 4. Create Staff & Admin Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@craftverse.hospital',
      passwordHash: defaultPasswordHash,
      name: 'Eleanor Vance (Hospital Director)',
      phone: '+1-555-0100',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const receptionUser = await prisma.user.create({
    data: {
      email: 'reception@craftverse.hospital',
      passwordHash: defaultPasswordHash,
      name: 'Marcus Brody (Front Desk)',
      phone: '+1-555-0101',
      role: 'RECEPTIONIST',
      isActive: true,
    },
  });

  // 5. Create Doctor Users & Profiles
  const doc1User = await prisma.user.create({
    data: {
      email: 'dr.sharma@craftverse.hospital',
      passwordHash: defaultPasswordHash,
      name: 'Dr. Rajesh Sharma',
      phone: '+1-555-0102',
      role: 'DOCTOR',
      isActive: true,
    },
  });

  const doc1 = await prisma.doctor.create({
    data: {
      doctorCode: 'DOC-001',
      userId: doc1User.id,
      name: 'Dr. Rajesh Sharma',
      specialization: 'Interventional Cardiology',
      departmentId: cardiology.id,
      avgConsultationDuration: 15,
      status: 'DELAYED',
      currentDelayMinutes: 20,
      delayReason: 'Emergency angioplasty handover',
      roomNumber: 'Room 201',
    },
  });

  const doc2User = await prisma.user.create({
    data: {
      email: 'dr.patil@craftverse.hospital',
      passwordHash: defaultPasswordHash,
      name: 'Dr. Ananya Patil',
      phone: '+1-555-0103',
      role: 'DOCTOR',
      isActive: true,
    },
  });

  const doc2 = await prisma.doctor.create({
    data: {
      doctorCode: 'DOC-002',
      userId: doc2User.id,
      name: 'Dr. Ananya Patil',
      specialization: 'Orthopedic Surgery',
      departmentId: orthopedics.id,
      avgConsultationDuration: 12,
      status: 'BUSY',
      currentDelayMinutes: 0,
      roomNumber: 'Room 105',
    },
  });

  const doc3User = await prisma.user.create({
    data: {
      email: 'dr.chen@craftverse.hospital',
      passwordHash: defaultPasswordHash,
      name: 'Dr. Michael Chen',
      phone: '+1-555-0104',
      role: 'DOCTOR',
      isActive: true,
    },
  });

  const doc3 = await prisma.doctor.create({
    data: {
      doctorCode: 'DOC-003',
      userId: doc3User.id,
      name: 'Dr. Michael Chen',
      specialization: 'Pediatrics & Neonatology',
      departmentId: pediatrics.id,
      avgConsultationDuration: 10,
      status: 'AVAILABLE',
      currentDelayMinutes: 0,
      roomNumber: 'Room 302',
    },
  });

  const doc4User = await prisma.user.create({
    data: {
      email: 'dr.martinez@craftverse.hospital',
      passwordHash: defaultPasswordHash,
      name: 'Dr. Sofia Martinez',
      phone: '+1-555-0105',
      role: 'DOCTOR',
      isActive: true,
    },
  });

  const doc4 = await prisma.doctor.create({
    data: {
      doctorCode: 'DOC-004',
      userId: doc4User.id,
      name: 'Dr. Sofia Martinez',
      specialization: 'Internal Medicine',
      departmentId: generalMed.id,
      avgConsultationDuration: 15,
      status: 'AVAILABLE',
      currentDelayMinutes: 0,
      roomNumber: 'Room 102',
    },
  });

  const doc5User = await prisma.user.create({
    data: {
      email: 'dr.adams@craftverse.hospital',
      passwordHash: defaultPasswordHash,
      name: 'Dr. David Adams',
      phone: '+1-555-0106',
      role: 'DOCTOR',
      isActive: true,
    },
  });

  const doc5 = await prisma.doctor.create({
    data: {
      doctorCode: 'DOC-005',
      userId: doc5User.id,
      name: 'Dr. David Adams',
      specialization: 'Neurology & Stroke',
      departmentId: neurology.id,
      avgConsultationDuration: 20,
      status: 'AVAILABLE',
      currentDelayMinutes: 0,
      roomNumber: 'Room 308',
    },
  });

  console.log('Created 5 Doctors.');

  // Record historical doctor delay for Dr. Sharma
  await prisma.doctorDelay.create({
    data: {
      doctorId: doc1.id,
      delayMinutes: 20,
      reason: 'Emergency angioplasty handover',
      isResolved: false,
    },
  });

  // 6. Create Primary Demo Patient User
  const demoPatientUser = await prisma.user.create({
    data: {
      email: 'patient@craftverse.hospital',
      passwordHash: defaultPasswordHash,
      name: 'Arthur Pendelton',
      phone: '+1-555-0200',
      role: 'PATIENT',
      isActive: true,
    },
  });

  const demoPatient = await prisma.patient.create({
    data: {
      patientCode: 'PAT-100024',
      userId: demoPatientUser.id,
      name: 'Arthur Pendelton',
      email: 'patient@craftverse.hospital',
      phone: '+1-555-0200',
      gender: 'MALE',
      dateOfBirth: new Date('1988-04-12'),
      address: '742 Evergreen Terrace, Springfield',
      emergencyContact: 'Sarah Pendelton (+1-555-0201)',
      travelPreference: {
        create: {
          originAddress: '742 Evergreen Terrace, Springfield',
          travelTimeMinutes: 25,
          safetyBufferMinutes: 10,
          transportMode: 'DRIVING',
        },
      },
    },
  });

  // 7. Create 25+ Realistic Patients with Travel Preferences
  const patientDataList = [
    { name: 'Beatrice Miller', phone: '+1-555-0202', gender: 'FEMALE', dob: '1975-08-23', travel: 30, buffer: 10 },
    { name: 'Carlos Rodriguez', phone: '+1-555-0203', gender: 'MALE', dob: '1992-11-05', travel: 15, buffer: 5 },
    { name: 'Diana Prince', phone: '+1-555-0204', gender: 'FEMALE', dob: '1984-03-19', travel: 40, buffer: 15 },
    { name: 'Ethan Hunt', phone: '+1-555-0205', gender: 'MALE', dob: '1979-06-14', travel: 20, buffer: 10 },
    { name: 'Fiona Gallagher', phone: '+1-555-0206', gender: 'FEMALE', dob: '1996-01-30', travel: 35, buffer: 10 },
    { name: 'George Clark', phone: '+1-555-0207', gender: 'MALE', dob: '1968-09-12', travel: 25, buffer: 10 },
    { name: 'Hannah Abbott', phone: '+1-555-0208', gender: 'FEMALE', dob: '2001-12-04', travel: 10, buffer: 5 },
    { name: 'Ian Malcolm', phone: '+1-555-0209', gender: 'MALE', dob: '1952-07-22', travel: 45, buffer: 15 },
    { name: 'Julia Roberts', phone: '+1-555-0210', gender: 'FEMALE', dob: '1967-10-28', travel: 20, buffer: 10 },
    { name: 'Kevin Flynn', phone: '+1-555-0211', gender: 'MALE', dob: '1982-04-15', travel: 30, buffer: 10 },
    { name: 'Laura Croft', phone: '+1-555-0212', gender: 'FEMALE', dob: '1990-02-14', travel: 15, buffer: 5 },
    { name: 'Marcus Aurelius', phone: '+1-555-0213', gender: 'MALE', dob: '1970-04-26', travel: 50, buffer: 20 },
    { name: 'Nadia Comaneci', phone: '+1-555-0214', gender: 'FEMALE', dob: '1961-11-12', travel: 25, buffer: 10 },
    { name: 'Oliver Twist', phone: '+1-555-0215', gender: 'MALE', dob: '2015-05-08', travel: 20, buffer: 10 },
    { name: 'Penelope Cruz', phone: '+1-555-0216', gender: 'FEMALE', dob: '1974-04-28', travel: 35, buffer: 15 },
    { name: 'Quentin Tarantino', phone: '+1-555-0217', gender: 'MALE', dob: '1963-03-27', travel: 40, buffer: 10 },
    { name: 'Rachel Green', phone: '+1-555-0218', gender: 'FEMALE', dob: '1994-05-05', travel: 15, buffer: 5 },
    { name: 'Samuel Jackson', phone: '+1-555-0219', gender: 'MALE', dob: '1948-12-21', travel: 30, buffer: 10 },
    { name: 'Tina Turner', phone: '+1-555-0220', gender: 'FEMALE', dob: '1939-11-26', travel: 25, buffer: 10 },
    { name: 'Uma Thurman', phone: '+1-555-0221', gender: 'FEMALE', dob: '1970-04-29', travel: 20, buffer: 5 },
    { name: 'Victor Vance', phone: '+1-555-0222', gender: 'MALE', dob: '1985-07-18', travel: 35, buffer: 10 },
    { name: 'Wendy Darling', phone: '+1-555-0223', gender: 'FEMALE', dob: '2008-09-02', travel: 15, buffer: 10 },
    { name: 'Xavier Woods', phone: '+1-555-0224', gender: 'MALE', dob: '1986-09-04', travel: 25, buffer: 5 },
    { name: 'Yvonne Strahovski', phone: '+1-555-0225', gender: 'FEMALE', dob: '1982-07-30', travel: 30, buffer: 10 },
    { name: 'Zachary Levi', phone: '+1-555-0226', gender: 'MALE', dob: '1980-09-29', travel: 20, buffer: 10 },
  ];

  const createdPatients = [demoPatient];

  for (let i = 0; i < patientDataList.length; i++) {
    const item = patientDataList[i];
    const patientCode = `PAT-${100025 + i}`;
    const p = await prisma.patient.create({
      data: {
        patientCode,
        name: item.name,
        email: `${item.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: item.phone,
        gender: item.gender,
        dateOfBirth: new Date(item.dob),
        address: `${100 + i * 12} Oakwood Avenue, City`,
        travelPreference: {
          create: {
            travelTimeMinutes: item.travel,
            safetyBufferMinutes: item.buffer,
            transportMode: 'DRIVING',
          },
        },
      },
    });
    createdPatients.push(p);
  }

  console.log(`Created ${createdPatients.length} Patients.`);

  // 8. Create Active Today Queues for Doctors
  const qSharma = await prisma.queue.create({
    data: {
      doctorId: doc1.id,
      queueDate: today,
      status: 'ACTIVE',
      currentNumber: 1,
      totalTokens: 7,
    },
  });

  const qPatil = await prisma.queue.create({
    data: {
      doctorId: doc2.id,
      queueDate: today,
      status: 'ACTIVE',
      currentNumber: 2,
      totalTokens: 5,
    },
  });

  const qChen = await prisma.queue.create({
    data: {
      doctorId: doc3.id,
      queueDate: today,
      status: 'ACTIVE',
      currentNumber: 1,
      totalTokens: 4,
    },
  });

  const qMartinez = await prisma.queue.create({
    data: {
      doctorId: doc4.id,
      queueDate: today,
      status: 'ACTIVE',
      currentNumber: 0,
      totalTokens: 3,
    },
  });

  // 9. Seed Active Visits for Dr. Sharma (Cardiology) - showcases full feature set
  // Token 1: IN_CONSULTATION
  const v1 = await prisma.visit.create({
    data: {
      visitCode: `VISIT-${today.replace(/-/g, '')}-0001`,
      patientId: createdPatients[1].id,
      doctorId: doc1.id,
      queueId: qSharma.id,
      status: 'IN_CONSULTATION',
      priorityLevel: 0,
      checkInTime: subMinutes(now, 50),
      calledTime: subMinutes(now, 10),
      consultationStartTime: subMinutes(now, 8),
    },
  });
  await prisma.token.create({
    data: {
      tokenNumber: 1,
      tokenDisplay: 'DR-S-001',
      visitId: v1.id,
      doctorId: doc1.id,
      queueDate: today,
    },
  });

  // Token 2: Emergency Inserted (Priority Level 2) -> Position 1 in Waiting
  const v2 = await prisma.visit.create({
    data: {
      visitCode: `VISIT-${today.replace(/-/g, '')}-0002`,
      patientId: createdPatients[2].id,
      doctorId: doc1.id,
      queueId: qSharma.id,
      status: 'WAITING',
      priorityLevel: 2, // Emergency
      checkInTime: subMinutes(now, 15),
      notes: 'Emergency acute chest pain triage',
    },
  });
  await prisma.token.create({
    data: {
      tokenNumber: 2,
      tokenDisplay: 'DR-S-002',
      visitId: v2.id,
      doctorId: doc1.id,
      queueDate: today,
    },
  });

  // Token 3: Priority Patient (Priority Level 1) -> Position 2 in Waiting
  const v3 = await prisma.visit.create({
    data: {
      visitCode: `VISIT-${today.replace(/-/g, '')}-0003`,
      patientId: createdPatients[3].id,
      doctorId: doc1.id,
      queueId: qSharma.id,
      status: 'WAITING',
      priorityLevel: 1,
      checkInTime: subMinutes(now, 45),
      notes: 'Elderly post-op checkup',
    },
  });
  await prisma.token.create({
    data: {
      tokenNumber: 3,
      tokenDisplay: 'DR-S-003',
      visitId: v3.id,
      doctorId: doc1.id,
      queueDate: today,
    },
  });

  // Token 4: Demo Patient (Arthur Pendelton) -> Position 3 in Waiting!
  const v4 = await prisma.visit.create({
    data: {
      visitCode: `VISIT-${today.replace(/-/g, '')}-0004`,
      patientId: demoPatient.id,
      doctorId: doc1.id,
      queueId: qSharma.id,
      status: 'WAITING',
      priorityLevel: 0,
      checkInTime: subMinutes(now, 35),
      notes: 'Annual cardiology follow-up & hypertension assessment',
    },
  });
  await prisma.token.create({
    data: {
      tokenNumber: 4,
      tokenDisplay: 'DR-S-004',
      visitId: v4.id,
      doctorId: doc1.id,
      queueDate: today,
    },
  });

  // Token 5: Normal Patient Waiting
  const v5 = await prisma.visit.create({
    data: {
      visitCode: `VISIT-${today.replace(/-/g, '')}-0005`,
      patientId: createdPatients[4].id,
      doctorId: doc1.id,
      queueId: qSharma.id,
      status: 'WAITING',
      priorityLevel: 0,
      checkInTime: subMinutes(now, 20),
    },
  });
  await prisma.token.create({
    data: {
      tokenNumber: 5,
      tokenDisplay: 'DR-S-005',
      visitId: v5.id,
      doctorId: doc1.id,
      queueDate: today,
    },
  });

  // Token 6: Completed Earlier
  const v6 = await prisma.visit.create({
    data: {
      visitCode: `VISIT-${today.replace(/-/g, '')}-0006`,
      patientId: createdPatients[5].id,
      doctorId: doc1.id,
      queueId: qSharma.id,
      status: 'COMPLETED',
      priorityLevel: 0,
      checkInTime: subMinutes(now, 110),
      calledTime: subMinutes(now, 85),
      consultationStartTime: subMinutes(now, 80),
      consultationEndTime: subMinutes(now, 65),
    },
  });
  await prisma.token.create({
    data: {
      tokenNumber: 6,
      tokenDisplay: 'DR-S-006',
      visitId: v6.id,
      doctorId: doc1.id,
      queueDate: today,
    },
  });
  await prisma.consultation.create({
    data: {
      visitId: v6.id,
      doctorId: doc1.id,
      patientId: createdPatients[5].id,
      actualDurationMinutes: 15,
      diagnosis: 'Sinus arrhythmia - benign',
      prescription: 'Lifestyle management, reduce caffeine',
      notes: 'Patient reassured, follow up in 6 months',
    },
  });

  // Token 7: No-Show
  const v7 = await prisma.visit.create({
    data: {
      visitCode: `VISIT-${today.replace(/-/g, '')}-0007`,
      patientId: createdPatients[6].id,
      doctorId: doc1.id,
      queueId: qSharma.id,
      status: 'NO_SHOW',
      priorityLevel: 0,
      checkInTime: subMinutes(now, 120),
      calledTime: subMinutes(now, 90),
    },
  });
  await prisma.token.create({
    data: {
      tokenNumber: 7,
      tokenDisplay: 'DR-S-007',
      visitId: v7.id,
      doctorId: doc1.id,
      queueDate: today,
    },
  });

  // 10. Seed Visits for Dr. Patil (Orthopedics)
  const vp1 = await prisma.visit.create({
    data: {
      visitCode: `VISIT-${today.replace(/-/g, '')}-0010`,
      patientId: createdPatients[7].id,
      doctorId: doc2.id,
      queueId: qPatil.id,
      status: 'CALLED',
      priorityLevel: 0,
      checkInTime: subMinutes(now, 40),
      calledTime: subMinutes(now, 2),
    },
  });
  await prisma.token.create({
    data: {
      tokenNumber: 1,
      tokenDisplay: 'DR-P-001',
      visitId: vp1.id,
      doctorId: doc2.id,
      queueDate: today,
    },
  });

  const vp2 = await prisma.visit.create({
    data: {
      visitCode: `VISIT-${today.replace(/-/g, '')}-0011`,
      patientId: createdPatients[8].id,
      doctorId: doc2.id,
      queueId: qPatil.id,
      status: 'WAITING',
      priorityLevel: 0,
      checkInTime: subMinutes(now, 25),
    },
  });
  await prisma.token.create({
    data: {
      tokenNumber: 2,
      tokenDisplay: 'DR-P-002',
      visitId: vp2.id,
      doctorId: doc2.id,
      queueDate: today,
    },
  });

  // 11. Seed Appointments for Today & Tomorrow
  await prisma.appointment.create({
    data: {
      appointmentCode: `APT-${today.replace(/-/g, '')}-0101`,
      patientId: demoPatient.id,
      doctorId: doc1.id,
      departmentId: cardiology.id,
      scheduledDate: today,
      scheduledTime: '10:30',
      status: 'CHECKED_IN',
      type: 'ONLINE',
      notes: 'Online appointment confirmed via portal',
    },
  });

  await prisma.appointment.create({
    data: {
      appointmentCode: `APT-${today.replace(/-/g, '')}-0102`,
      patientId: createdPatients[9].id,
      doctorId: doc3.id,
      departmentId: pediatrics.id,
      scheduledDate: today,
      scheduledTime: '11:15',
      status: 'CONFIRMED',
      type: 'ONLINE',
    },
  });

  await prisma.appointment.create({
    data: {
      appointmentCode: `APT-${today.replace(/-/g, '')}-0103`,
      patientId: createdPatients[10].id,
      doctorId: doc4.id,
      departmentId: generalMed.id,
      scheduledDate: today,
      scheduledTime: '14:00',
      status: 'BOOKED',
      type: 'ONLINE',
    },
  });

  // 12. Seed Historical Past 7 Days Visits for Rich Analytics
  for (let d = 1; d <= 7; d++) {
    const pastDate = format(subDays(now, d), 'yyyy-MM-dd');
    const pastQueue = await prisma.queue.create({
      data: {
        doctorId: doc1.id,
        queueDate: pastDate,
        status: 'CLOSED',
        currentNumber: 15,
        totalTokens: 15,
      },
    });

    const baseHistDate = new Date(`${pastDate}T09:00:00.000Z`);

    for (let p = 0; p < 12; p++) {
      const patientIdx = (d * 3 + p) % createdPatients.length;
      const checkInTime = addMinutes(baseHistDate, p * 30);
      const calledTime = addMinutes(checkInTime, 12);
      const startTime = addMinutes(calledTime, 2);
      const endTime = addMinutes(startTime, 15);

      const histVisit = await prisma.visit.create({
        data: {
          visitCode: `VISIT-${pastDate.replace(/-/g, '')}-${String(p + 1).padStart(4, '0')}`,
          patientId: createdPatients[patientIdx].id,
          doctorId: doc1.id,
          queueId: pastQueue.id,
          status: p === 10 ? 'NO_SHOW' : p === 11 ? 'CANCELLED' : 'COMPLETED',
          priorityLevel: p === 0 ? 1 : 0,
          checkInTime,
          calledTime,
          consultationStartTime: startTime,
          consultationEndTime: endTime,
        },
      });

      if (p < 10) {
        await prisma.consultation.create({
          data: {
            visitId: histVisit.id,
            doctorId: doc1.id,
            patientId: createdPatients[patientIdx].id,
            actualDurationMinutes: 14 + (p % 4),
            diagnosis: 'Routine health assessment & blood pressure monitoring',
            prescription: 'Medication refill & dietary sodium restriction',
          },
        });
      }
    }
  }

  // 13. Seed Notifications
  await prisma.notification.create({
    data: {
      recipientType: 'PATIENT',
      patientId: demoPatient.id,
      userId: demoPatientUser.id,
      title: 'Token DR-S-004 Generated',
      message: 'You have checked in for Dr. Rajesh Sharma. Estimated consultation: 11:35 AM.',
      channel: 'IN_APP',
      eventType: 'TOKEN_GENERATED',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      recipientType: 'PATIENT',
      patientId: demoPatient.id,
      userId: demoPatientUser.id,
      title: 'Doctor Delay Alert',
      message: 'Dr. Rajesh Sharma is running 20 minutes behind schedule due to emergency surgery handover.',
      channel: 'IN_APP',
      eventType: 'DOCTOR_DELAY',
      isRead: false,
    },
  });

  // 14. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      actorName: 'Marcus Brody',
      actorRole: 'RECEPTIONIST',
      action: 'PATIENT_CHECKED_IN',
      entity: 'Visit',
      entityId: v4.id,
      afterState: JSON.stringify({ token: 'DR-S-004', patientName: 'Arthur Pendelton', doctor: 'Dr. Rajesh Sharma' }),
      reason: 'Online appointment arrival verification',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorName: 'Dr. Rajesh Sharma',
      actorRole: 'DOCTOR',
      action: 'DOCTOR_DELAY_UPDATED',
      entity: 'Doctor',
      entityId: doc1.id,
      afterState: JSON.stringify({ delayMinutes: 20, reason: 'Emergency angioplasty handover' }),
      reason: 'Emergency angioplasty handover',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorName: 'Marcus Brody',
      actorRole: 'RECEPTIONIST',
      action: 'EMERGENCY_INSERTED',
      entity: 'Visit',
      entityId: v2.id,
      afterState: JSON.stringify({ token: 'DR-S-002', priority: 2, reason: 'Acute chest pain' }),
      reason: 'Acute chest pain triage fast-track',
    },
  });

  console.log('Database seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('DEMO ACCOUNTS FOR LOCAL TESTING:');
  console.log('1. Admin:        admin@craftverse.hospital       / Password123!');
  console.log('2. Receptionist: reception@craftverse.hospital   / Password123!');
  console.log('3. Doctor:       dr.sharma@craftverse.hospital   / Password123!');
  console.log('4. Doctor:       dr.patil@craftverse.hospital    / Password123!');
  console.log('5. Patient:      patient@craftverse.hospital     / Password123!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
