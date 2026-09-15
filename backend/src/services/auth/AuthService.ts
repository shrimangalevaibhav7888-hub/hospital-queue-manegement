import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../repositories/prisma/prismaClient';
import { env } from '../../config/env';
import { UserRole } from '../../config/constants';
import { AuthUserPayload, LoginResponseData } from '../../types/api';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: UserRole;
    gender?: string;
    doctorSpecialization?: string;
    departmentId?: string;
    roomNumber?: string;
  }): Promise<LoginResponseData> {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        phone: data.phone || null,
        role: data.role,
        isActive: true,
      },
    });

    let patientId: string | undefined;
    let patientCode: string | undefined;
    let doctorId: string | undefined;

    if (data.role === 'PATIENT') {
      const count = await prisma.patient.count();
      const randSuffix = Math.floor(1000 + Math.random() * 9000);
      patientCode = `PAT-${100000 + count + randSuffix}`;
      const patient = await prisma.patient.create({
        data: {
          patientCode,
          userId: user.id,
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone || '+1-555-0100',
          gender: data.gender || 'OTHER',
          travelPreference: {
            create: {
              travelTimeMinutes: 25,
              safetyBufferMinutes: 10,
              transportMode: 'DRIVING',
            },
          },
        },
      });
      patientId = patient.id;
    } else if (data.role === 'DOCTOR') {
      const count = await prisma.doctor.count();
      const doctorCode = `DOC-${String(count + 1).padStart(3, '0')}`;
      const doctor = await prisma.doctor.create({
        data: {
          doctorCode,
          userId: user.id,
          name: data.name.startsWith('Dr.') ? data.name : `Dr. ${data.name}`,
          specialization: data.doctorSpecialization || 'General Medicine',
          departmentId: data.departmentId || (await prisma.department.findFirst())?.id || 'dept-1',
          avgConsultationDuration: 15,
          status: 'AVAILABLE',
          roomNumber: data.roomNumber || `Room ${100 + count + 1}`,
        },
      });
      doctorId = doctor.id;
    }

    const accessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
      doctorId,
      patientId,
    });

    const refreshToken = this.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
      doctorId,
      patientId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        phone: user.phone,
        doctorId,
        patientId,
        patientCode,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<LoginResponseData> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const payload: AuthUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
      doctorId: user.doctor?.id,
      patientId: user.patient?.id,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        phone: user.phone,
        doctorId: user.doctor?.id,
        patientId: user.patient?.id,
        patientCode: user.patient?.patientCode,
      },
      accessToken,
      refreshToken,
    };
  }

  generateAccessToken(payload: AuthUserPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '1h',
    });
  }

  generateRefreshToken(payload: AuthUserPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
  }

  verifyAccessToken(token: string): AuthUserPayload {
    return jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
  }

  verifyRefreshToken(token: string): AuthUserPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthUserPayload;
  }
}
