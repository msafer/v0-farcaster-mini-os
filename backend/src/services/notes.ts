import { PrismaClient } from '@prisma/client';
import { AppError, type NoteResponse } from '../types/index.js';

export class NotesService {
  constructor(private prisma: PrismaClient) {}

  async createNote(userId: string, bodyMd: string, isPublic = true): Promise<NoteResponse> {
    return await this.prisma.$transaction(async (tx) => {
      // Get the next entry number for this user
      const lastNote = await tx.note.findFirst({
        where: { userId },
        orderBy: { entryNumber: 'desc' },
        select: { entryNumber: true }
      });

      const entryNumber = (lastNote?.entryNumber || 0) + 1;

      // Create the note
      const note = await tx.note.create({
        data: {
          userId,
          entryNumber,
          bodyMd,
          isPublic,
        },
        include: {
          user: {
            select: {
              fid: true,
              fname: true,
              lensProfile: true,
            }
          }
        }
      });

      return this.formatNoteResponse(note);
    });
  }

  async getNotesByUser(handle: string, limit = 20, offset = 0, includePrivate = false): Promise<NoteResponse[]> {
    // Find user by fname or lens profile
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { fname: handle },
          { lensProfile: handle }
        ]
      },
      select: { id: true }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const whereClause: any = { userId: user.id };
    if (!includePrivate) {
      whereClause.isPublic = true;
    }

    const notes = await this.prisma.note.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: { entryNumber: 'desc' },
      include: {
        user: {
          select: {
            fid: true,
            fname: true,
            lensProfile: true,
          }
        }
      }
    });

    return notes.map(note => this.formatNoteResponse(note));
  }

  async getAllPublicNotes(limit = 20, offset = 0): Promise<NoteResponse[]> {
    const notes = await this.prisma.note.findMany({
      where: { isPublic: true },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fid: true,
            fname: true,
            lensProfile: true,
          }
        }
      }
    });

    return notes.map(note => this.formatNoteResponse(note));
  }

  async getNoteById(noteId: string, requestingUserId?: string): Promise<NoteResponse> {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: {
        user: {
          select: {
            id: true,
            fid: true,
            fname: true,
            lensProfile: true,
          }
        }
      }
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    // Check if user can access private note
    if (!note.isPublic && note.user.id !== requestingUserId) {
      throw new AppError(403, 'Access denied to private note');
    }

    return this.formatNoteResponse(note);
  }

  async updateNote(noteId: string, userId: string, bodyMd: string, isPublic?: boolean): Promise<NoteResponse> {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true }
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    if (note.userId !== userId) {
      throw new AppError(403, 'Cannot edit another user\'s note');
    }

    const updateData: any = { bodyMd };
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
    }

    const updatedNote = await this.prisma.note.update({
      where: { id: noteId },
      data: updateData,
      include: {
        user: {
          select: {
            fid: true,
            fname: true,
            lensProfile: true,
          }
        }
      }
    });

    return this.formatNoteResponse(updatedNote);
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true }
    });

    if (!note) {
      throw new AppError(404, 'Note not found');
    }

    if (note.userId !== userId) {
      throw new AppError(403, 'Cannot delete another user\'s note');
    }

    await this.prisma.note.delete({
      where: { id: noteId }
    });
  }

  async getUserNoteStats(userId: string): Promise<{ totalNotes: number; publicNotes: number; privateNotes: number }> {
    const [totalNotes, publicNotes] = await Promise.all([
      this.prisma.note.count({ where: { userId } }),
      this.prisma.note.count({ where: { userId, isPublic: true } })
    ]);

    return {
      totalNotes,
      publicNotes,
      privateNotes: totalNotes - publicNotes
    };
  }

  private formatNoteResponse(note: any): NoteResponse {
    return {
      id: note.id,
      entryNumber: note.entryNumber,
      bodyMd: note.bodyMd,
      createdAt: note.createdAt.toISOString(),
      isPublic: note.isPublic,
      user: {
        fid: note.user.fid,
        fname: note.user.fname,
        lensProfile: note.user.lensProfile,
      }
    };
  }
}
