import { z } from 'zod';

// Environment validation
export const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string(),
  S3_ENDPOINT: z.string(),
  S3_REGION: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_PUBLIC_URL_BASE: z.string(),
  FARCASTER_CLIENT_ID: z.string(),
  FARCASTER_CLIENT_SECRET: z.string(),
  FARCASTER_REDIRECT_URI: z.string(),
  MAX_IMAGE_SIZE_MB: z.string().default('2'),
  MAX_IMAGE_DIMENSION: z.string().default('1440'),
  REROLL_COOLDOWN_MINUTES: z.string().default('10'),
  CHAT_MESSAGE_MAX_LENGTH: z.string().default('180'),
  COST_POST_IMAGE: z.string().default('5'),
  COST_REROLL_SEARCH: z.string().default('10'),
  COST_FIRST_LIKE: z.string().default('10'),
});

export type Env = z.infer<typeof envSchema>;

// API Request/Response types
export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfp?: string;
  bio?: string;
}

export interface AuthCallbackRequest {
  code: string;
  state?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    fid: number;
    fname: string;
    lensProfile?: string;
    creditsBalanceCents: number;
  };
}

export interface PostCreateRequest {
  image: Buffer;
  promptTag?: string;
}

export interface PostResponse {
  id: string;
  userId: string;
  imageUrl: string;
  promptTag?: string;
  createdAtUtc: string;
  likeCountPublic: number;
  userLiked?: boolean;
  user: {
    fid: number;
    fname: string;
    lensProfile?: string;
  };
}

export interface NoteCreateRequest {
  bodyMd: string;
  isPublic?: boolean;
}

export interface NoteResponse {
  id: string;
  entryNumber: number;
  bodyMd: string;
  createdAt: string;
  isPublic: boolean;
  user: {
    fid: number;
    fname: string;
    lensProfile?: string;
  };
}

export interface UserProfileResponse {
  id: string;
  fid: number;
  fname: string;
  lensProfile?: string;
  creditsBalanceCents: number;
  nextPostAt?: string;
  dailyFreeStatus: {
    freeImageAvailable: boolean;
    freeLikeAvailable: boolean;
  };
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  rewardType: 'free_image' | 'free_like';
  completed: boolean;
}

export interface SearchResult {
  users: Array<{
    id: string;
    fid: number;
    fname: string;
    lensProfile: string;
  }>;
  canReroll: boolean;
  nextRerollAt?: string;
}

export interface TreasuryResponse {
  totalCredits: string;
  totalPosts: number;
  totalUsers: number;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  user: {
    fid: number;
    fname: string;
  };
}

export interface ReportRequest {
  targetType: 'post' | 'user' | 'chat_message';
  targetId: string;
  reason: string;
}

// Error types
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Credit transaction reasons
export const CREDIT_REASONS = {
  POST_IMAGE: 'post_image',
  LIKE_POST: 'like_post',
  REROLL_SEARCH: 'reroll_search',
  TASK_COMPLETION: 'task_completion',
  ADMIN_ADJUSTMENT: 'admin_adjustment',
} as const;

export type CreditReason = typeof CREDIT_REASONS[keyof typeof CREDIT_REASONS];

// Daily task types
export interface DailyTaskData {
  id: string;
  title: string;
  description: string;
  rewardType: 'free_image' | 'free_like';
  meta?: Record<string, any>;
}
