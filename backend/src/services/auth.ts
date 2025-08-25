import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { env } from '../utils/env.js';
import { AppError, type FarcasterUser, type AuthResponse } from '../types/index.js';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async handleFarcasterCallback(code: string): Promise<AuthResponse> {
    try {
      // Exchange code for user data (simplified - in real implementation you'd call Farcaster API)
      const farcasterUser = await this.getFarcasterUserFromCode(code);
      
      // Find or create user
      let user = await this.prisma.user.findUnique({
        where: { fid: farcasterUser.fid }
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            fid: farcasterUser.fid,
            fname: farcasterUser.username,
            wallets: [],
            creditsBalanceCents: 0,
          }
        });

        // Update treasury stats
        await this.updateTreasuryStats();
      }

      // Generate JWT token (simplified)
      const token = this.generateJWT(user.id);

      return {
        token,
        user: {
          id: user.id,
          fid: user.fid,
          fname: user.fname,
          lensProfile: user.lensProfile,
          creditsBalanceCents: user.creditsBalanceCents,
        }
      };
    } catch (error) {
      throw new AppError(400, 'Failed to authenticate with Farcaster');
    }
  }

  async linkLensProfile(userId: string, walletAddress: string, signature: string, message: string): Promise<void> {
    try {
      // Verify the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new AppError(400, 'Invalid signature');
      }

      // In a real implementation, you'd resolve the Lens profile from the wallet
      const lensProfile = await this.resolveLensProfile(walletAddress);
      
      if (!lensProfile) {
        throw new AppError(400, 'No Lens profile found for this wallet');
      }

      // Update user with Lens profile and wallet
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lensProfile,
          wallets: {
            push: walletAddress.toLowerCase()
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(400, 'Failed to link Lens profile');
    }
  }

  private async getFarcasterUserFromCode(code: string): Promise<FarcasterUser> {
    // In a real implementation, this would call the Farcaster API
    // For now, we'll simulate a response
    const mockResponse: FarcasterUser = {
      fid: Math.floor(Math.random() * 100000) + 1000,
      username: `user_${code.slice(0, 8)}`,
      displayName: `User ${code.slice(0, 8)}`,
    };

    return mockResponse;
  }

  private async resolveLensProfile(walletAddress: string): Promise<string | null> {
    // In a real implementation, this would query the Lens Protocol
    // For now, we'll simulate a response
    const mockProfiles = ['alice.lens', 'bob.lens', 'charlie.lens'];
    return mockProfiles[Math.floor(Math.random() * mockProfiles.length)];
  }

  private generateJWT(userId: string): string {
    // In a real implementation, use proper JWT signing
    // This is a simplified version
    const payload = { userId, iat: Date.now() };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  async verifyJWT(token: string): Promise<string> {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      return payload.userId;
    } catch {
      throw new AppError(401, 'Invalid token');
    }
  }

  private async updateTreasuryStats(): Promise<void> {
    const userCount = await this.prisma.user.count();
    const postCount = await this.prisma.post.count();
    
    await this.prisma.treasury.upsert({
      where: { id: 'main' },
      update: {
        totalUsers: userCount,
        totalPosts: postCount,
        lastUpdated: new Date(),
      },
      create: {
        id: 'main',
        totalCredits: 0n,
        totalUsers: userCount,
        totalPosts: postCount,
      }
    });
  }
}
