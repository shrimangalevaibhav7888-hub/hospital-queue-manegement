import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

describe('RBAC & Auth Middleware Tests', () => {
  const patientToken = jwt.sign(
    {
      userId: 'test-patient-user-id',
      email: 'patient@test.com',
      role: 'PATIENT',
      name: 'Test Patient',
    },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const doctorToken = jwt.sign(
    {
      userId: 'test-doctor-user-id',
      email: 'doctor@test.com',
      role: 'DOCTOR',
      name: 'Dr. Test',
      doctorId: 'test-doc-id',
    },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const receptionToken = jwt.sign(
    {
      userId: 'test-reception-user-id',
      email: 'reception@test.com',
      role: 'RECEPTIONIST',
      name: 'Test Receptionist',
    },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  test('Public Health check succeeds without token', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ONLINE');
  });

  test('Protected routes reject requests without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('Patient role is rejected from calling doctor action (CALL NEXT)', async () => {
    const res = await request(app)
      .post('/api/queues/doctor/some-doctor-id/call-next')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('Patient role is rejected from emergency insertion', async () => {
    const res = await request(app)
      .post('/api/queues/emergency-insert')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: 'doc-1',
        name: 'Urgent Patient',
        phone: '123456',
        priorityLevel: 2,
        reason: 'Emergency',
      });

    expect(res.status).toBe(403);
  });

  test('Receptionist role is rejected from starting consultation', async () => {
    const res = await request(app)
      .post('/api/queues/visit/some-visit-id/start')
      .set('Authorization', `Bearer ${receptionToken}`)
      .send({});

    expect(res.status).toBe(403);
  });
});
