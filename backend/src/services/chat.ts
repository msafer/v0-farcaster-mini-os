import { PrismaClient } from '@prisma/client';
import { AppError, type ChatMessage } from '../types/index.js';
import { config } from '../utils/env.js';

export class ChatService {
  constructor(private prisma: PrismaClient) {}

  async sendMessage(userId: string, room: string, text: string): Promise<ChatMessage> {
    // Validate message length
    if (text.length > config.chatMessageMaxLength) {
      throw new AppError(400, `Message too long. Maximum ${config.chatMessageMaxLength} characters.`);
    }

    // Validate text content (only text and emoji)
    if (!this.isValidChatText(text)) {
      throw new AppError(400, 'Message contains invalid characters. Only text and emoji allowed.');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        userId,
        room,
        text: text.trim()
      },
      include: {
        user: {
          select: {
            fid: true,
            fname: true
          }
        }
      }
    });

    return this.formatChatMessage(message);
  }

  async getMessages(room: string, limit = 50, before?: string): Promise<ChatMessage[]> {
    const whereClause: any = { room };
    
    if (before) {
      whereClause.createdAt = { lt: new Date(before) };
    }

    const messages = await this.prisma.chatMessage.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fid: true,
            fname: true
          }
        }
      }
    });

    return messages.reverse().map(msg => this.formatChatMessage(msg));
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { userId: true }
    });

    if (!message) {
      throw new AppError(404, 'Message not found');
    }

    if (message.userId !== userId) {
      throw new AppError(403, 'Cannot delete another user\'s message');
    }

    await this.prisma.chatMessage.delete({
      where: { id: messageId }
    });
  }

  async getRoomStats(room: string): Promise<{ messageCount: number; activeUsers: number }> {
    const [messageCount, activeUsers] = await Promise.all([
      this.prisma.chatMessage.count({ where: { room } }),
      this.prisma.chatMessage.groupBy({
        by: ['userId'],
        where: {
          room,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    return {
      messageCount,
      activeUsers: activeUsers.length
    };
  }

  async moderateMessage(messageId: string, action: 'delete' | 'flag'): Promise<void> {
    if (action === 'delete') {
      await this.prisma.chatMessage.delete({
        where: { id: messageId }
      });
    }
    // Flag action would be implemented with a moderation system
  }

  private isValidChatText(text: string): boolean {
    // Allow alphanumeric, spaces, basic punctuation, and emoji
    // This is a simplified validation - in production you'd use a more sophisticated approach
    const allowedPattern = /^[\w\s.,!?;:()\-+=\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]*$/u;
    return allowedPattern.test(text);
  }

  private formatChatMessage(message: any): ChatMessage {
    return {
      id: message.id,
      userId: message.userId,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
      user: {
        fid: message.user.fid,
        fname: message.user.fname
      }
    };
  }
}
