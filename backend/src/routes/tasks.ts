import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TasksService } from '../services/tasks.js';
import { CreditsService } from '../services/credits.js';
import { AppError, type TaskResponse } from '../types/index.js';

export async function tasksRoutes(fastify: FastifyInstance) {
  const creditsService = new CreditsService(fastify.prisma);
  const tasksService = new TasksService(fastify.prisma, creditsService);

  // Get today's tasks
  fastify.get<{
    Reply: TaskResponse[];
  }>('/tasks/today', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const tasks = await tasksService.getTodaysTasks(request.userId);
      reply.send(tasks);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Complete a task
  fastify.post<{
    Params: { id: string };
  }>('/tasks/:id/complete', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const result = await tasksService.completeTask(request.userId, request.params.id);
      reply.send(result);
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Get user task stats
  fastify.get('/tasks/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const stats = await tasksService.getUserTaskStats(request.userId);
      reply.send(stats);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
