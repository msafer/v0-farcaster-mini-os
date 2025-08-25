import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { env } from '../utils/env.js';
import { AppError, type FarcasterUser, type AuthResponse } from '../types/index.js';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async handleFarcasterCallback(authData: any): Promise<AuthResponse> {
    try {
      // AuthKit provides the user data directly
      const farcasterUser = {
        fid: authData.fid,
        username: authData.username,
        displayName: authData.displayName || authData.username,
      };

      // Verify using Neynar API if available
      if (env.NEYNAR_API_KEY) {
        try {
          const neynarResponse = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${farcasterUser.fid}`, {
            headers: {
              'accept': 'application/json',
              'api_key': env.NEYNAR_API_KEY
            }
          });

          if (neynarResponse.ok) {
            const neynarData = await neynarResponse.json();
            const neynarUser = neynarData.users?.[0];
            if (neynarUser) {
              farcasterUser.username = neynarUser.username;
              farcasterUser.displayName = neynarUser.display_name || neynarUser.username;
            }
          }
        } catch (neynarError) {
          console.warn('Neynar verification failed, using AuthKit data:', neynarError);
        }
      }
      
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
    try {
      // Exchange code for access token with Farcaster/Warpcast OAuth
      const tokenResponse = await fetch('https://api.warpcast.com/v2/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.FARCASTER_CLIENT_ID,
          client_secret: env.FARCASTER_CLIENT_SECRET,
          redirect_uri: env.FARCASTER_REDIRECT_URI,
          grant_type: 'authorization_code',
          code,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      
      // Get user info with access token
      const userResponse = await fetch('https://api.warpcast.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData = await userResponse.json();
      
      return {
        fid: userData.result.user.fid,
        username: userData.result.user.username,
        displayName: userData.result.user.displayName || userData.result.user.username,
      };
    } catch (error) {
      console.error('Error getting Farcaster user:', error);
      // Fallback to mock data for development
      return {
        fid: Math.floor(Math.random() * 100000) + 1000,
        username: `user_${code.slice(0, 8)}`,
        displayName: `User ${code.slice(0, 8)}`,
      };
    }
  }

  private async resolveLensProfile(walletAddress: string): Promise<string | null> {
    try {
      // Query Lens Protocol to find profiles owned by this wallet
      const query = `
        query Profiles($where: ProfilesRequest!) {
          profiles(request: $where) {
            items {
              id
              handle {
                fullHandle
                localName
              }
              metadata {
                displayName
              }
            }
          }
        }
      `;

      const response = await fetch('https://api-v2.lens.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            where: {
              ownedBy: [walletAddress]
            }
          }
        })
      });

      const data = await response.json();
      const profiles = data?.data?.profiles?.items || [];
      
      if (profiles.length > 0) {
        // Return the handle of the first profile
        return profiles[0].handle?.fullHandle || profiles[0].handle?.localName || null;
      }

      return null;
    } catch (error) {
      console.error('Error resolving Lens profile:', error);
      return null;
    }
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
