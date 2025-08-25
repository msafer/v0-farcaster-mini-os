import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ModerationService } from '../services/moderation.js';
import { AppError, type ReportRequest } from '../types/index.js';

const reportSchema = z.object({
  targetType: z.enum(['post', 'user', 'chat_message']),
  targetId: z.string(),
  reason: z.string()
});

export async function moderationRoutes(fastify: FastifyInstance) {
  const moderationService = new ModerationService(fastify.prisma);

  // Submit a report
  fastify.post<{
    Body: ReportRequest;
  }>('/report', {
    schema: {
      body: reportSchema
    },
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const report = await moderationService.submitReport(request.userId, request.body);
      reply.code(201).send(report);
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Get reports (admin endpoint)
  fastify.get('/admin/reports', {
    // Note: In production, add admin authentication middleware
  }, async (request, reply) => {
    try {
      const reports = await moderationService.getReports();
      reply.send(reports);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Review report (admin endpoint)
  fastify.post<{
    Params: { id: string };
    Body: { action: 'approve' | 'dismiss' };
  }>('/admin/reports/:id/review', {
    // Note: In production, add admin authentication middleware
  }, async (request, reply) => {
    try {
      const { action } = request.body;
      await moderationService.reviewReport(request.params.id, action);
      reply.send({ success: true, message: `Report ${action}d successfully` });
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Get moderation stats (admin endpoint)
  fastify.get('/admin/moderation/stats', {
    // Note: In production, add admin authentication middleware
  }, async (request, reply) => {
    try {
      const stats = await moderationService.getModerationStats();
      reply.send(stats);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
