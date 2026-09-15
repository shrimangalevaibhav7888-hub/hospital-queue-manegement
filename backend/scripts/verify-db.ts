import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('====================================================');
  console.log('🏥 CAREFLOW HEALTH — DATABASE INTEGRITY CHECK');
  console.log('====================================================\n');

  try {
    // 1. Connection check
    await prisma.$connect();
    console.log('✅ SQLite Database Connection: SUCCESSFUL\n');

    // 2. Query all tables/models
    const [
      userCount,
      patientCount,
      doctorCount,
      deptCount,
      queueCount,
      visitCount,
      tokenCount,
      appointmentCount,
      consultationCount,
      delayCount,
      notificationCount,
      auditLogCount,
      travelPrefCount,
      queueConfig,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.department.count(),
      prisma.queue.count(),
      prisma.visit.count(),
      prisma.token.count(),
      prisma.appointment.count(),
      prisma.consultation.count(),
      prisma.doctorDelay.count(),
      prisma.notification.count(),
      prisma.auditLog.count(),
      prisma.travelPreference.count(),
      prisma.queueConfiguration.findFirst(),
    ]);

    console.log('📊 MODEL RECORD COUNTS:');
    console.log(` • Users:              ${userCount}`);
    console.log(` • Patients:           ${patientCount}`);
    console.log(` • Doctors:            ${doctorCount}`);
    console.log(` • Departments:        ${deptCount}`);
    console.log(` • Queues:             ${queueCount}`);
    console.log(` • Visits:             ${visitCount}`);
    console.log(` • Tokens:             ${tokenCount}`);
    console.log(` • Appointments:       ${appointmentCount}`);
    console.log(` • Consultations:      ${consultationCount}`);
    console.log(` • Doctor Delays:      ${delayCount}`);
    console.log(` • Notifications:      ${notificationCount}`);
    console.log(` • Audit Logs:         ${auditLogCount}`);
    console.log(` • Travel Preferences: ${travelPrefCount}`);
    console.log(` • Hospital Name:      ${queueConfig?.hospitalName || 'N/A'}`);
    console.log('');

    // 3. Test relational queries
    console.log('🔗 TESTING RELATIONAL QUERIES:');
    const sampleDoctor = await prisma.doctor.findFirst({
      include: {
        department: true,
        user: { select: { email: true, role: true } },
        queues: { take: 1 },
      },
    });
    if (sampleDoctor) {
      console.log(` • Doctor Relation: Dr. ${sampleDoctor.name} [Dept: ${sampleDoctor.department.name}, Role: ${sampleDoctor.user.role}] - OK`);
    }

    const sampleVisit = await prisma.visit.findFirst({
      include: {
        patient: true,
        doctor: true,
        token: true,
      },
    });
    if (sampleVisit) {
      console.log(` • Visit Relation: Token ${sampleVisit.token?.tokenDisplay || 'N/A'} for Patient ${sampleVisit.patient.name} -> Dr. ${sampleVisit.doctor.name} - OK`);
    }

    // 4. Test CRUD write & delete transaction
    console.log('\n🧪 TESTING WRITE & CLEANUP TRANSACTIONS:');
    const testLog = await prisma.auditLog.create({
      data: {
        actorName: 'System Health Check',
        actorRole: 'SYSTEM',
        action: 'DB_VERIFICATION_PROBE',
        entity: 'Database',
        entityId: 'probe-01',
      },
    });
    console.log(` • Write Test: Created Probe Record ID: ${testLog.id} - OK`);

    await prisma.auditLog.delete({
      where: { id: testLog.id },
    });
    console.log(` • Delete Test: Cleaned Probe Record - OK`);

    console.log('\n====================================================');
    console.log('🎉 ALL DATABASE MODELS & QUERIES WORKING 100% PERFECTLY!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
