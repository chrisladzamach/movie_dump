import http from 'http';
import app from './app';
import { env } from './config/env';
import { testConnection } from './config/database';
import { initSocket } from './config/socket';

async function bootstrap() {
  try {
    await testConnection();
    console.log('MySQL connected');

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(env.port, () => {
      console.log(`Movie Dump API running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
