import { PrismaClient } from '@prisma/client';
import { AppError, type TreasuryResponse } from '../types/index.js';

export class TreasuryService {
  constructor(private prisma: PrismaClient) {}

  async getTreasurySummary(): Promise<TreasuryResponse> {
    const treasury = await this.prisma.treasury.findUnique({
      where: { id: 'main' }
    });

    if (!treasury) {
      // Initialize treasury if it doesn't exist
      const [totalUsers, totalPosts] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.post.count()
      ]);

      const newTreasury = await this.prisma.treasury.create({
        data: {
          id: 'main',
          totalCredits: 0n,
          totalUsers,
          totalPosts,
        }
      });

      return {
        totalCredits: newTreasury.totalCredits.toString(),
        totalPosts: newTreasury.totalPosts,
        totalUsers: newTreasury.totalUsers,
        lastUpdated: newTreasury.lastUpdated.toISOString()
      };
    }

    return {
      totalCredits: treasury.totalCredits.toString(),
      totalPosts: treasury.totalPosts,
      totalUsers: treasury.totalUsers,
      lastUpdated: treasury.lastUpdated.toISOString()
    };
  }

  async getDetailedStats(): Promise<any> {
    const [
      treasury,
      recentPosts,
      activeUsers,
      totalCreditsSpent,
      totalLikes
    ] = await Promise.all([
      this.getTreasurySummary(),
      this.prisma.post.count({
        where: {
          createdAtUtc: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      this.prisma.user.count({
        where: {
          posts: {
            some: {
              createdAtUtc: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            }
          }
        }
      }),
      this.prisma.creditsLedger.aggregate({
        where: { deltaCents: { lt: 0 } },
        _sum: { deltaCents: true }
      }),
      this.prisma.postLike.count()
    ]);

    return {
      ...treasury,
      stats: {
        recentPosts,
        activeUsers,
        totalCreditsSpent: Math.abs(totalCreditsSpent._sum.deltaCents || 0),
        totalLikes,
        averageCreditsPerUser: Math.round(
          parseInt(treasury.totalCredits) / Math.max(treasury.totalUsers, 1)
        )
      }
    };
  }

  async updateTreasuryStats(): Promise<void> {
    const [totalUsers, totalPosts, totalCredits] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count(),
      this.prisma.creditsLedger.aggregate({
        where: { deltaCents: { gt: 0 } },
        _sum: { deltaCents: true }
      })
    ]);

    await this.prisma.treasury.upsert({
      where: { id: 'main' },
      update: {
        totalUsers,
        totalPosts,
        totalCredits: BigInt(totalCredits._sum.deltaCents || 0),
        lastUpdated: new Date()
      },
      create: {
        id: 'main',
        totalCredits: BigInt(totalCredits._sum.deltaCents || 0),
        totalUsers,
        totalPosts,
      }
    });
  }
}
