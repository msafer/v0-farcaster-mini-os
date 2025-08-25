import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../types/index.js';
import { AuthService } from '../services/auth.js';

export interface AuthenticatedRequest extends FastifyRequest {
  userId: string;
}

export function createAuthMiddleware(authService: AuthService) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(401, 'Missing or invalid authorization header');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const userId = await authService.verifyJWT(token);

      // Add userId to request object
      (request as AuthenticatedRequest).userId = userId;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(401, 'Invalid authentication token');
    }
  };
}

export function createOptionalAuthMiddleware(authService: AuthService) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const userId = await authService.verifyJWT(token);
        (request as AuthenticatedRequest).userId = userId;
      }
    } catch (error) {
      // For optional auth, we ignore errors and continue without userId
    }
  };
}
