import { UserRole } from '../config/constants';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  doctorId?: string;
  patientId?: string;
}

export interface LoginResponseData {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string | null;
    doctorId?: string;
    patientId?: string;
    patientCode?: string;
  };
  accessToken: string;
  refreshToken: string;
}
