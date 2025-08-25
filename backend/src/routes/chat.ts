import { FastifyInstance } from 'fastify';
import { ChatService } from '../services/chat.js';
import { AuthService } from '../services/auth.js';
import { AppError, type ChatMessage } from '../types/index.js';

export async function chatRoutes(fastify: FastifyInstance) {
  const chatService = new ChatService(fastify.prisma);
  const authService = new AuthService(fastify.prisma);

  // WebSocket endpoint for chat
  fastify.register(async function (fastify) {
    fastify.get('/chat', { websocket: true }, (connection, request) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const room = url.searchParams.get('room');
      const token = url.searchParams.get('token');

      if (!room || !token) {
        connection.close(1008, 'Missing room or token parameter');
        return;
      }

      let userId: string | null = null;
      let authenticated = false;

      // Authenticate user
      authService.verifyJWT(token)
        .then(id => {
          userId = id;
          authenticated = true;
          
          // Send welcome message
          connection.send(JSON.stringify({
            type: 'connected',
            room,
            message: 'Connected to chat room'
          }));

          // Load recent messages
          return chatService.getMessages(room, 20);
        })
        .then(messages => {
          connection.send(JSON.stringify({
            type: 'history',
            messages
          }));
        })
        .catch(error => {
          connection.close(1008, 'Authentication failed');
        });

      connection.on('message', async (rawMessage) => {
        if (!authenticated || !userId) {
          return;
        }

        try {
          const data = JSON.parse(rawMessage.toString());
          
          if (data.type === 'message' && data.text) {
            const message = await chatService.sendMessage(userId, room, data.text);
            
            // Broadcast to all connections in the room (simplified)
            // In production, you'd maintain a room-based connection registry
            connection.send(JSON.stringify({
              type: 'message',
              message
            }));
          }
        } catch (error) {
          connection.send(JSON.stringify({
            type: 'error',
            message: error instanceof AppError ? error.message : 'Invalid message format'
          }));
        }
      });

      connection.on('close', () => {
        // Clean up connection
      });
    });
  });

  // REST endpoint to get chat messages
  fastify.get<{
    Querystring: { room: string; before?: string; limit?: string };
  }>('/chat/messages', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { room, before, limit } = request.query;
      
      if (!room) {
        reply.code(400).send({ error: 'Room parameter is required' });
        return;
      }

      const messages = await chatService.getMessages(
        room, 
        limit ? parseInt(limit) : 50, 
        before
      );
      
      reply.send({ messages });
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get room stats
  fastify.get<{
    Params: { room: string };
  }>('/chat/rooms/:room/stats', async (request, reply) => {
    try {
      const stats = await chatService.getRoomStats(request.params.room);
      reply.send(stats);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Delete message (user's own or admin)
  fastify.delete<{
    Params: { id: string };
  }>('/chat/messages/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      await chatService.deleteMessage(request.params.id, request.userId);
      reply.send({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });
}
