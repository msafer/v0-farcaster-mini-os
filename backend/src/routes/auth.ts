import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../services/auth.js';
import { AppError, type AuthCallbackRequest, type AuthResponse } from '../types/index.js';

const callbackSchema = z.object({
  code: z.string(),
  state: z.string().optional()
});

const lensLinkSchema = z.object({
  walletAddress: z.string(),
  signature: z.string(),
  message: z.string()
});

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.prisma);

  // Farcaster OAuth callback
  fastify.post<{
    Body: AuthCallbackRequest;
    Reply: AuthResponse;
  }>('/auth/fc/callback', {
    schema: {
      body: callbackSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                fid: { type: 'number' },
                fname: { type: 'string' },
                lensProfile: { type: 'string', nullable: true },
                creditsBalanceCents: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { code } = request.body;
      const authResponse = await authService.handleFarcasterCallback(code);
      
      reply.code(200).send(authResponse);
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Link Lens profile
  fastify.post('/link/lens', {
    schema: {
      body: lensLinkSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { walletAddress, signature, message } = request.body;
      
      await authService.linkLensProfile(
        request.userId,
        walletAddress,
        signature,
        message
      );
      
      reply.send({ success: true, message: 'Lens profile linked successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });
}
