import { PrismaClient } from '@prisma/client';
import { startOfDay } from 'date-fns';
import { AppError, CREDIT_REASONS, type CreditReason } from '../types/index.js';

export class CreditsService {
  constructor(private prisma: PrismaClient) {}

  async chargeUser(userId: string, amountCents: number, reason: CreditReason, meta?: any): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { creditsBalanceCents: true }
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      if (user.creditsBalanceCents < amountCents) {
        throw new AppError(400, 'Insufficient credits');
      }

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          creditsBalanceCents: {
            decrement: amountCents
          }
        }
      });

      // Record transaction
      await tx.creditsLedger.create({
        data: {
          userId,
          deltaCents: -amountCents,
          reason,
          meta
        }
      });

      // Update treasury
      await this.updateTreasuryCredits(tx, amountCents);
    });
  }

  async grantCredits(userId: string, amountCents: number, reason: CreditReason, meta?: any): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          creditsBalanceCents: {
            increment: amountCents
          }
        }
      });

      // Record transaction
      await tx.creditsLedger.create({
        data: {
          userId,
          deltaCents: amountCents,
          reason,
          meta
        }
      });
    });
  }

  async checkDailyFreeStatus(userId: string): Promise<{ freeImageAvailable: boolean; freeLikeAvailable: boolean }> {
    const today = startOfDay(new Date());
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        freeImageUsedOn: true,
        freeLikeUsedOn: true
      }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const freeImageAvailable = !user.freeImageUsedOn || 
      startOfDay(user.freeImageUsedOn).getTime() !== today.getTime();
    
    const freeLikeAvailable = !user.freeLikeUsedOn || 
      startOfDay(user.freeLikeUsedOn).getTime() !== today.getTime();

    return { freeImageAvailable, freeLikeAvailable };
  }

  async useDailyFree(userId: string, type: 'image' | 'like'): Promise<void> {
    const today = new Date();
    const updateData = type === 'image' 
      ? { freeImageUsedOn: today }
      : { freeLikeUsedOn: today };

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  async getCreditsBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { creditsBalanceCents: true }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user.creditsBalanceCents;
  }

  private async updateTreasuryCredits(tx: any, amountCents: number): Promise<void> {
    await tx.treasury.upsert({
      where: { id: 'main' },
      update: {
        totalCredits: {
          increment: BigInt(amountCents)
        },
        lastUpdated: new Date()
      },
      create: {
        id: 'main',
        totalCredits: BigInt(amountCents),
        totalUsers: 0,
        totalPosts: 0,
      }
    });
  }
}
