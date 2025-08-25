import dotenv from 'dotenv';
import { envSchema, type Env } from '../types/index.js';

dotenv.config();

export const env: Env = envSchema.parse(process.env);

export const config = {
  port: parseInt(env.PORT),
  maxImageSizeMB: parseInt(env.MAX_IMAGE_SIZE_MB),
  maxImageDimension: parseInt(env.MAX_IMAGE_DIMENSION),
  rerollCooldownMinutes: parseInt(env.REROLL_COOLDOWN_MINUTES),
  chatMessageMaxLength: parseInt(env.CHAT_MESSAGE_MAX_LENGTH),
  costs: {
    postImage: parseInt(env.COST_POST_IMAGE),
    rerollSearch: parseInt(env.COST_REROLL_SEARCH),
    firstLike: parseInt(env.COST_FIRST_LIKE),
  },
} as const;
