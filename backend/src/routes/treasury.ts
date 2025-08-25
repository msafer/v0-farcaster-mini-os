import { FastifyInstance } from 'fastify';
import { TreasuryService } from '../services/treasury.js';
import { type TreasuryResponse } from '../types/index.js';

export async function treasuryRoutes(fastify: FastifyInstance) {
  const treasuryService = new TreasuryService(fastify.prisma);

  // Get treasury summary (public, read-only)
  fastify.get<{
    Reply: TreasuryResponse;
  }>('/treasury/summary', async (request, reply) => {
    try {
      const summary = await treasuryService.getTreasurySummary();
      reply.send(summary);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get detailed treasury stats (optional, for admins)
  fastify.get('/treasury/stats', async (request, reply) => {
    try {
      const stats = await treasuryService.getDetailedStats();
      reply.send(stats);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
