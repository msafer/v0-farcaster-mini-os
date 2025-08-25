import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import websocket from '@fastify/websocket';
import { config } from './utils/env.js';
import { createAuthMiddleware, createOptionalAuthMiddleware } from './middleware/auth.js';
import { AuthService } from './services/auth.js';

// Import routes
import { authRoutes } from './routes/auth.js';
import { postsRoutes } from './routes/posts.js';
import { notesRoutes } from './routes/notes.js';
import { userRoutes } from './routes/user.js';
import { tasksRoutes } from './routes/tasks.js';
import { searchRoutes } from './routes/search.js';
import { treasuryRoutes } from './routes/treasury.js';
import { moderationRoutes } from './routes/moderation.js';
import { chatRoutes } from './routes/chat.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: any;
    optionalAuth: any;
  }
  interface FastifyRequest {
    userId?: string;
  }
}

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      }
    }
  });

  // Initialize Prisma
  const prisma = new PrismaClient();
  await prisma.$connect();

  // Register plugins
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend-domain.com'] 
      : true,
    credentials: true
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: config.maxImageSizeMB * 1024 * 1024 // Convert MB to bytes
    }
  });

  await fastify.register(websocket);

  // Add Prisma to Fastify instance
  fastify.decorate('prisma', prisma);

  // Create auth services and middleware
  const authService = new AuthService(prisma);
  fastify.decorate('authenticate', createAuthMiddleware(authService));
  fastify.decorate('optionalAuth', createOptionalAuthMiddleware(authService));

  // Error handler
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error);
    
    if (error.statusCode) {
      reply.status(error.statusCode).send({ 
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      });
    } else {
      reply.status(500).send({ 
        error: 'Internal Server Error',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  // Health check
  fastify.get('/health', async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      reply.send({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    } catch (error) {
      reply.status(503).send({ 
        status: 'unhealthy', 
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // API routes
  await fastify.register(authRoutes);
  await fastify.register(postsRoutes);
  await fastify.register(notesRoutes);
  await fastify.register(userRoutes);
  await fastify.register(tasksRoutes);
  await fastify.register(searchRoutes);
  await fastify.register(treasuryRoutes);
  await fastify.register(moderationRoutes);
  await fastify.register(chatRoutes);

  // 404 handler
  fastify.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({ 
      error: 'Route not found',
      code: 'NOT_FOUND',
      path: request.url
    });
  });

  // Graceful shutdown
  const gracefulShutdown = async () => {
    fastify.log.info('Starting graceful shutdown...');
    try {
      await fastify.close();
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      fastify.log.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  return fastify;
}

async function start() {
  try {
    const fastify = await buildServer();
    
    await fastify.listen({ 
      port: config.port, 
      host: '0.0.0.0' 
    });
    
    console.log(`🚀 Snel OS Backend running on port ${config.port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${config.port}/health`);
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export { buildServer };
