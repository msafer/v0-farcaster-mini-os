import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SearchService } from '../services/search.js';
import { CreditsService } from '../services/credits.js';
import { AppError, type SearchResult } from '../types/index.js';

const searchQuerySchema = z.object({
  q: z.string().min(1).optional()
});

export async function searchRoutes(fastify: FastifyInstance) {
  const creditsService = new CreditsService(fastify.prisma);
  const searchService = new SearchService(fastify.prisma, creditsService);

  // Get random 10 eligible users
  fastify.get<{
    Reply: SearchResult;
  }>('/search/random10', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const result = await searchService.getRandomEligibleUsers(request.userId);
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Reroll random search
  fastify.post<{
    Reply: SearchResult;
  }>('/search/reroll', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const result = await searchService.rerollSearch(request.userId);
      reply.send(result);
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Search users by handle/username
  fastify.get<{
    Querystring: { q?: string };
  }>('/search/users', {
    schema: {
      querystring: searchQuerySchema
    }
  }, async (request, reply) => {
    try {
      const { q } = request.query;
      
      if (!q) {
        reply.send([]);
        return;
      }

      const users = await searchService.searchUsersByHandle(q);
      reply.send(users);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get user profile
  fastify.get<{
    Params: { id: string };
  }>('/search/users/:id', {
    preHandler: [fastify.optionalAuth]
  }, async (request, reply) => {
    try {
      const profile = await searchService.getUserProfile(request.params.id, request.userId);
      reply.send(profile);
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });
}
