import { PrismaClient } from '@prisma/client';
import { addMinutes } from 'date-fns';
import { AppError, type SearchResult } from '../types/index.js';
import { CreditsService } from './credits.js';
import { config } from '../utils/env.js';
import { CREDIT_REASONS } from '../types/index.js';

export class SearchService {
  constructor(
    private prisma: PrismaClient,
    private creditsService: CreditsService
  ) {}

  async getRandomEligibleUsers(userId: string): Promise<SearchResult> {
    // Get random Lens-linked users (eligible users)
    const eligibleUsers = await this.prisma.user.findMany({
      where: {
        AND: [
          { lensProfile: { not: null } },
          { id: { not: userId } } // Exclude current user
        ]
      },
      select: {
        id: true,
        fid: true,
        fname: true,
        lensProfile: true
      },
      take: 50 // Get more than needed for randomization
    });

    if (eligibleUsers.length === 0) {
      return {
        users: [],
        canReroll: false
      };
    }

    // Randomly select 10 users
    const shuffled = eligibleUsers.sort(() => Math.random() - 0.5);
    const selectedUsers = shuffled.slice(0, Math.min(10, shuffled.length));

    // Check reroll availability
    const canReroll = await this.canUserReroll(userId);
    const nextRerollAt = await this.getNextRerollTime(userId);

    return {
      users: selectedUsers.map(user => ({
        id: user.id,
        fid: user.fid,
        fname: user.fname,
        lensProfile: user.lensProfile!
      })),
      canReroll,
      nextRerollAt: nextRerollAt?.toISOString()
    };
  }

  async rerollSearch(userId: string): Promise<SearchResult> {
    // Check cooldown
    const canReroll = await this.canUserReroll(userId);
    if (!canReroll) {
      const nextRerollTime = await this.getNextRerollTime(userId);
      throw new AppError(400, `Reroll on cooldown. Next reroll available at ${nextRerollTime?.toISOString()}`);
    }

    // Charge user for reroll
    await this.creditsService.chargeUser(
      userId,
      config.costs.rerollSearch,
      CREDIT_REASONS.REROLL_SEARCH
    );

    // Update last reroll time
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastRerollAt: new Date() }
    });

    // Return new random selection
    return this.getRandomEligibleUsers(userId);
  }

  async searchUsersByHandle(query: string, limit = 10): Promise<Array<{ id: string; fid: number; fname: string; lensProfile?: string }>> {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { fname: { contains: query, mode: 'insensitive' } },
          { lensProfile: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        fid: true,
        fname: true,
        lensProfile: true
      },
      take: limit
    });

    return users;
  }

  async getUserProfile(userId: string, requestingUserId?: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fid: true,
        fname: true,
        lensProfile: true,
        joinedAt: true,
        posts: {
          where: { createdAtUtc: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // Last 30 days
          select: { id: true }
        },
        notes: {
          where: { isPublic: true },
          select: { id: true }
        }
      }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      id: user.id,
      fid: user.fid,
      fname: user.fname,
      lensProfile: user.lensProfile,
      joinedAt: user.joinedAt.toISOString(),
      stats: {
        recentPosts: user.posts.length,
        publicNotes: user.notes.length
      }
    };
  }

  private async canUserReroll(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastRerollAt: true }
    });

    if (!user?.lastRerollAt) {
      return true; // Never rerolled before
    }

    const cooldownEnd = addMinutes(user.lastRerollAt, config.rerollCooldownMinutes);
    return new Date() >= cooldownEnd;
  }

  private async getNextRerollTime(userId: string): Promise<Date | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastRerollAt: true }
    });

    if (!user?.lastRerollAt) {
      return null; // Can reroll now
    }

    const nextRerollTime = addMinutes(user.lastRerollAt, config.rerollCooldownMinutes);
    return nextRerollTime > new Date() ? nextRerollTime : null;
  }
}
