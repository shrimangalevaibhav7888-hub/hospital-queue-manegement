import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorMiddleware';
import { sendSuccess } from './utils/response';

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  return sendSuccess(res, {
    status: 'ONLINE',
    system: 'CareFlow Hospital Queue System',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
