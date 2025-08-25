import { FastifyInstance } from 'fastify';
import { PostsService } from '../services/posts.js';
import { CreditsService } from '../services/credits.js';
import { StorageService } from '../services/storage.js';
import { ImageService } from '../services/image.js';
import { type UserProfileResponse } from '../types/index.js';

export async function userRoutes(fastify: FastifyInstance) {
  const storageService = new StorageService();
  const imageService = new ImageService();
  const creditsService = new CreditsService(fastify.prisma);
  const postsService = new PostsService(fastify.prisma, storageService, imageService, creditsService);

  // Get current user profile
  fastify.get<{
    Reply: UserProfileResponse;
  }>('/me', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.userId },
        select: {
          id: true,
          fid: true,
          fname: true,
          lensProfile: true,
          creditsBalanceCents: true
        }
      });

      if (!user) {
        reply.code(404).send({ error: 'User not found' });
        return;
      }

      const [nextPostAt, dailyFreeStatus] = await Promise.all([
        postsService.getNextPostTime(request.userId),
        creditsService.checkDailyFreeStatus(request.userId)
      ]);

      const profile: UserProfileResponse = {
        id: user.id,
        fid: user.fid,
        fname: user.fname,
        lensProfile: user.lensProfile,
        creditsBalanceCents: user.creditsBalanceCents,
        nextPostAt: nextPostAt?.toISOString(),
        dailyFreeStatus: {
          freeImageAvailable: dailyFreeStatus.freeImageAvailable,
          freeLikeAvailable: dailyFreeStatus.freeLikeAvailable
        }
      };

      reply.send(profile);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get user profile by ID
  fastify.get<{
    Params: { id: string };
  }>('/users/:id', {
    preHandler: [fastify.optionalAuth]
  }, async (request, reply) => {
    try {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.params.id },
        select: {
          id: true,
          fid: true,
          fname: true,
          lensProfile: true,
          joinedAt: true,
          posts: {
            select: { id: true },
            take: 1
          },
          notes: {
            where: { isPublic: true },
            select: { id: true },
            take: 1
          }
        }
      });

      if (!user) {
        reply.code(404).send({ error: 'User not found' });
        return;
      }

      const profile = {
        id: user.id,
        fid: user.fid,
        fname: user.fname,
        lensProfile: user.lensProfile,
        joinedAt: user.joinedAt.toISOString(),
        stats: {
          hasLensProfile: !!user.lensProfile,
          hasPublicNotes: user.notes.length > 0,
          hasPosted: user.posts.length > 0
        }
      };

      reply.send(profile);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
