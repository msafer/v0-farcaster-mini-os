import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PostsService } from '../services/posts.js';
import { StorageService } from '../services/storage.js';
import { ImageService } from '../services/image.js';
import { CreditsService } from '../services/credits.js';
import { AppError, type PostResponse } from '../types/index.js';

const createPostSchema = z.object({
  promptTag: z.string().optional()
});

const querySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0)
});

export async function postsRoutes(fastify: FastifyInstance) {
  const storageService = new StorageService();
  const imageService = new ImageService();
  const creditsService = new CreditsService(fastify.prisma);
  const postsService = new PostsService(fastify.prisma, storageService, imageService, creditsService);

  // Create post
  fastify.post('/posts', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const data = await request.file();
      
      if (!data) {
        throw new AppError(400, 'Image file is required');
      }

      const buffer = await data.toBuffer();
      const promptTag = data.fields?.promptTag?.value as string;

      const post = await postsService.createPost(request.userId, buffer, promptTag);
      
      reply.code(201).send(post);
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Get posts (public feed)
  fastify.get<{
    Querystring: { limit?: string; offset?: string };
    Reply: PostResponse[];
  }>('/posts', {
    schema: {
      querystring: querySchema
    },
    preHandler: [fastify.optionalAuth]
  }, async (request, reply) => {
    try {
      const { limit, offset } = request.query;
      const posts = await postsService.getPosts(request.userId, limit, offset);
      
      reply.send(posts);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get user feed (personalized)
  fastify.get<{
    Querystring: { limit?: string; offset?: string };
    Reply: PostResponse[];
  }>('/feed', {
    schema: {
      querystring: querySchema
    },
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { limit, offset } = request.query;
      const posts = await postsService.getUserFeed(request.userId, limit, offset);
      
      reply.send(posts);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get specific post
  fastify.get<{
    Params: { id: string };
    Reply: PostResponse;
  }>('/posts/:id', {
    preHandler: [fastify.optionalAuth]
  }, async (request, reply) => {
    try {
      const post = await postsService.getPostById(request.params.id, request.userId);
      
      reply.send(post);
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Like post
  fastify.post<{
    Params: { id: string };
  }>('/posts/:id/like', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      await postsService.likePost(request.userId, request.params.id);
      
      reply.send({ success: true, message: 'Post liked successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });
}
