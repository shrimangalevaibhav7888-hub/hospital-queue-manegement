import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'craftverse_super_secret_jwt_access_key_2026_production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'craftverse_super_secret_jwt_refresh_key_2026_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:5000',
  DEFAULT_CONSULTATION_DURATION_MINUTES: parseInt(process.env.DEFAULT_CONSULTATION_DURATION_MINUTES || '15', 10),
  DEFAULT_SAFETY_BUFFER_MINUTES: parseInt(process.env.DEFAULT_SAFETY_BUFFER_MINUTES || '10', 10),
  DEFAULT_TRAVEL_TIME_MINUTES: parseInt(process.env.DEFAULT_TRAVEL_TIME_MINUTES || '25', 10),
  EMERGENCY_PRIORITY_BONUS: parseInt(process.env.EMERGENCY_PRIORITY_BONUS || '2', 10),
};
