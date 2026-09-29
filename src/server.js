import app from './app.js';
import { ENV } from './config/env.js';

const PORT = ENV.PORT;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 TeenSpend Backend Server running on port ${PORT}`);
  console.log(`📡 Environment: ${ENV.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

export default server;
