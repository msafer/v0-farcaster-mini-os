import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { AppError, type PostResponse } from '../types/index.js';
import { StorageService } from './storage.js';
import { ImageService } from './image.js';
import { CreditsService } from './credits.js';
import { config } from '../utils/env.js';
import { CREDIT_REASONS } from '../types/index.js';

export class PostsService {
  constructor(
    private prisma: PrismaClient,
    private storageService: StorageService,
    private imageService: ImageService,
    private creditsService: CreditsService
  ) {}

  async createPost(userId: string, imageBuffer: Buffer, promptTag?: string): Promise<PostResponse> {
    // Check daily limit
    await this.checkDailyPostLimit(userId);

    // Check if user can afford or has free image
    const freeStatus = await this.creditsService.checkDailyFreeStatus(userId);
    const canUseFree = freeStatus.freeImageAvailable;

    if (!canUseFree) {
      await this.creditsService.chargeUser(
        userId, 
        config.costs.postImage, 
        CREDIT_REASONS.POST_IMAGE,
        { promptTag }
      );
    } else {
      await this.creditsService.useDailyFree(userId, 'image');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Process and upload image
      const { buffer: processedBuffer, contentType } = await this.imageService.processAndValidateImage(imageBuffer);
      const imageUrl = await this.storageService.uploadImage(processedBuffer, contentType);

      // Create post
      const post = await tx.post.create({
        data: {
          userId,
          imageUrl,
          promptTag,
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

      // Update treasury stats
      await tx.treasury.upsert({
        where: { id: 'main' },
        update: {
          totalPosts: {
            increment: 1
          },
          lastUpdated: new Date()
        },
        create: {
          id: 'main',
          totalCredits: 0n,
          totalUsers: 0,
          totalPosts: 1,
        }
      });

      return this.formatPostResponse(post, false);
    });
  }

  async getPosts(userId?: string, limit = 20, offset = 0): Promise<PostResponse[]> {
    const posts = await this.prisma.post.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAtUtc: 'desc' },
      include: {
        user: {
          select: {
            fid: true,
            fname: true,
            lensProfile: true,
          }
        },
        likes: userId ? {
          where: { userId },
          select: { id: true }
        } : false
      }
    });

    return posts.map(post => this.formatPostResponse(post, Boolean(post.likes?.length)));
  }

  async getPostById(postId: string, userId?: string): Promise<PostResponse> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            fid: true,
            fname: true,
            lensProfile: true,
          }
        },
        likes: userId ? {
          where: { userId },
          select: { id: true }
        } : false
      }
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    return this.formatPostResponse(post, Boolean(post.likes?.length));
  }

  async likePost(userId: string, postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    if (post.userId === userId) {
      throw new AppError(400, 'Cannot like your own post');
    }

    // Check if already liked
    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    if (existingLike) {
      throw new AppError(400, 'Post already liked');
    }

    // Check if user can afford or has free like
    const freeStatus = await this.creditsService.checkDailyFreeStatus(userId);
    const canUseFree = freeStatus.freeLikeAvailable;

    if (!canUseFree) {
      await this.creditsService.chargeUser(
        userId, 
        config.costs.firstLike, 
        CREDIT_REASONS.LIKE_POST,
        { postId }
      );
    } else {
      await this.creditsService.useDailyFree(userId, 'like');
    }

    await this.prisma.$transaction(async (tx) => {
      // Create like
      await tx.postLike.create({
        data: {
          postId,
          userId
        }
      });

      // Update post like count
      await tx.post.update({
        where: { id: postId },
        data: {
          likeCountPublic: {
            increment: 1
          }
        }
      });
    });
  }

  async getUserFeed(userId: string, limit = 20, offset = 0): Promise<PostResponse[]> {
    // Get posts from users with Lens profiles (eligible users)
    const posts = await this.prisma.post.findMany({
      where: {
        user: {
          lensProfile: {
            not: null
          }
        }
      },
      take: limit,
      skip: offset,
      orderBy: { createdAtUtc: 'desc' },
      include: {
        user: {
          select: {
            fid: true,
            fname: true,
            lensProfile: true,
          }
        },
        likes: {
          where: { userId },
          select: { id: true }
        }
      }
    });

    return posts.map(post => this.formatPostResponse(post, Boolean(post.likes?.length)));
  }

  async getNextPostTime(userId: string): Promise<Date | null> {
    const today = startOfDay(new Date());
    
    const todaysPost = await this.prisma.post.findFirst({
      where: {
        userId,
        createdAtUtc: {
          gte: today,
          lt: endOfDay(today)
        }
      }
    });

    if (todaysPost) {
      return startOfDay(addDays(today, 1));
    }

    return null; // Can post now
  }

  private async checkDailyPostLimit(userId: string): Promise<void> {
    const today = startOfDay(new Date());
    const tomorrow = endOfDay(today);

    const todaysPost = await this.prisma.post.findFirst({
      where: {
        userId,
        createdAtUtc: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (todaysPost) {
      throw new AppError(400, 'Daily post limit reached. You can post again tomorrow.');
    }
  }

  private formatPostResponse(post: any, userLiked: boolean): PostResponse {
    return {
      id: post.id,
      userId: post.userId,
      imageUrl: post.imageUrl,
      promptTag: post.promptTag,
      createdAtUtc: post.createdAtUtc.toISOString(),
      likeCountPublic: post.likeCountPublic,
      userLiked,
      user: {
        fid: post.user.fid,
        fname: post.user.fname,
        lensProfile: post.user.lensProfile,
      }
    };
  }
}
