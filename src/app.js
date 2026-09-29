import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy: Origin not permitted'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// HTTP Request logging
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Global API rate limiter
app.use('/api', apiRateLimiter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the TeenSpend API 🚀',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Mount API routes
app.use('/api', apiRouter);

// 404 and Error handling middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
