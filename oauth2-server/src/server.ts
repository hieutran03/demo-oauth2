import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import sequelize from './dbs/init_postgres';
import { createDefaultOAuthClient } from './services/oauth.service';
import config from './config/config.app';

const env = process.env.NODE_ENV || 'dev';
process.title = `oauth2-server-${env}`;

const server = http.createServer(app);
const PORT = config.app.port || 3000;

async function startServer(): Promise<void> {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    await createDefaultOAuthClient();
    
    server.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`  OAuth2 Server (TypeScript)`);
      console.log(`========================================`);
      console.log(`  Environment: ${env}`);
      console.log(`  Server running at: http://localhost:${PORT}`);
      console.log(`  Swagger docs: http://localhost:${PORT}/api-docs`);
      console.log(`========================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
