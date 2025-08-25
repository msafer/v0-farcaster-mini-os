import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { NotesService } from '../services/notes.js';
import { AppError, type NoteResponse } from '../types/index.js';

const createNoteSchema = z.object({
  bodyMd: z.string(),
  isPublic: z.boolean().default(true)
});

const querySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0)
});

export async function notesRoutes(fastify: FastifyInstance) {
  const notesService = new NotesService(fastify.prisma);

  // Create note
  fastify.post<{
    Body: { bodyMd: string; isPublic?: boolean };
    Reply: NoteResponse;
  }>('/notes', {
    schema: {
      body: createNoteSchema
    },
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { bodyMd, isPublic } = request.body;
      const note = await notesService.createNote(request.userId, bodyMd, isPublic);
      
      reply.code(201).send(note);
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Get all public notes
  fastify.get<{
    Querystring: { limit?: string; offset?: string };
    Reply: NoteResponse[];
  }>('/notes', {
    schema: {
      querystring: querySchema
    }
  }, async (request, reply) => {
    try {
      const { limit, offset } = request.query;
      const notes = await notesService.getAllPublicNotes(limit, offset);
      
      reply.send(notes);
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get notes by user handle
  fastify.get<{
    Params: { handle: string };
    Querystring: { limit?: string; offset?: string };
    Reply: NoteResponse[];
  }>('/notes/:handle', {
    schema: {
      querystring: querySchema
    },
    preHandler: [fastify.optionalAuth]
  }, async (request, reply) => {
    try {
      const { handle } = request.params;
      const { limit, offset } = request.query;
      
      // Check if requesting user is the same as the handle owner for private notes
      const includePrivate = false; // Could implement logic to check ownership
      
      const notes = await notesService.getNotesByUser(handle, limit, offset, includePrivate);
      
      reply.send(notes);
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Get specific note
  fastify.get<{
    Params: { id: string };
    Reply: NoteResponse;
  }>('/notes/id/:id', {
    preHandler: [fastify.optionalAuth]
  }, async (request, reply) => {
    try {
      const note = await notesService.getNoteById(request.params.id, request.userId);
      
      reply.send(note);
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Update note
  fastify.put<{
    Params: { id: string };
    Body: { bodyMd: string; isPublic?: boolean };
    Reply: NoteResponse;
  }>('/notes/id/:id', {
    schema: {
      body: createNoteSchema
    },
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { bodyMd, isPublic } = request.body;
      const note = await notesService.updateNote(request.params.id, request.userId, bodyMd, isPublic);
      
      reply.send(note);
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // Delete note
  fastify.delete<{
    Params: { id: string };
  }>('/notes/id/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      await notesService.deleteNote(request.params.id, request.userId);
      
      reply.send({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        reply.code(error.statusCode).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });
}
