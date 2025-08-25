import { neynarClient, FARCASTER_CONFIG } from '@/config/services';

export interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url?: string;
  profile?: {
    bio?: {
      text: string;
    };
  };
  follower_count?: number;
  following_count?: number;
}

export interface FarcasterCast {
  hash: string;
  parent_hash?: string;
  parent_url?: string;
  root_parent_url?: string;
  parent_author?: {
    fid: number;
    username: string;
  };
  author: FarcasterUser;
  text: string;
  timestamp: string;
  embeds?: Array<{
    url?: string;
    cast_id?: {
      fid: number;
      hash: string;
    };
  }>;
  reactions?: {
    likes?: Array<{
      fid: number;
      fname: string;
    }>;
    recasts?: Array<{
      fid: number;
      fname: string;
    }>;
  };
  replies?: {
    count: number;
  };
}

export class FarcasterService {
  private client = neynarClient;

  async getUserByFid(fid: number): Promise<FarcasterUser | null> {
    if (!this.client) {
      throw new Error('Neynar client not configured');
    }

    try {
      const response = await this.client.fetchBulkUsers([fid]);
      return response.users?.[0] || null;
    } catch (error) {
      console.error('Error fetching user by FID:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<FarcasterUser | null> {
    if (!this.client) {
      throw new Error('Neynar client not configured');
    }

    try {
      const response = await this.client.lookupUserByUsername(username);
      return response.result?.user || null;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }

  async getCastsByFid(fid: number, limit = 25): Promise<FarcasterCast[]> {
    if (!this.client) {
      throw new Error('Neynar client not configured');
    }

    try {
      const response = await this.client.fetchCastsForUser(fid, {
        limit,
        include_replies: false
      });
      return response.casts || [];
    } catch (error) {
      console.error('Error fetching casts:', error);
      return [];
    }
  }

  async getFeed(fid: number, limit = 25): Promise<FarcasterCast[]> {
    if (!this.client) {
      throw new Error('Neynar client not configured');
    }

    try {
      const response = await this.client.fetchFeed('following', {
        fid,
        limit,
        with_recasts: true,
        with_replies: false
      });
      return response.casts || [];
    } catch (error) {
      console.error('Error fetching feed:', error);
      return [];
    }
  }

  async publishCast(
    signerUuid: string,
    text: string,
    parentUrl?: string,
    embeds?: Array<{ url: string }>
  ): Promise<{ success: boolean; cast?: any; error?: string }> {
    if (!this.client) {
      throw new Error('Neynar client not configured');
    }

    try {
      const response = await this.client.publishCast(signerUuid, text, {
        parent: parentUrl,
        embeds: embeds?.map(embed => ({ url: embed.url }))
      });

      return {
        success: true,
        cast: response
      };
    } catch (error) {
      console.error('Error publishing cast:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async likeCast(signerUuid: string, targetHash: string): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      throw new Error('Neynar client not configured');
    }

    try {
      await this.client.reactToCast(signerUuid, 'like', targetHash);
      return { success: true };
    } catch (error) {
      console.error('Error liking cast:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async recastCast(signerUuid: string, targetHash: string): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      throw new Error('Neynar client not configured');
    }

    try {
      await this.client.reactToCast(signerUuid, 'recast', targetHash);
      return { success: true };
    } catch (error) {
      console.error('Error recasting:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async searchUsers(query: string, limit = 10): Promise<FarcasterUser[]> {
    if (!this.client) {
      throw new Error('Neynar client not configured');
    }

    try {
      const response = await this.client.searchUser(query, limit);
      return response.result?.users || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // OAuth helpers
  static generateAuthUrl(): string {
    if (!FARCASTER_CONFIG.clientId || !FARCASTER_CONFIG.redirectUri) {
      throw new Error('Farcaster OAuth not configured');
    }

    const params = new URLSearchParams({
      client_id: FARCASTER_CONFIG.clientId,
      response_type: 'code',
      redirect_uri: FARCASTER_CONFIG.redirectUri,
      scope: 'read write'
    });

    return `https://warpcast.com/~/oauth/authorize?${params.toString()}`;
  }
}

export const farcasterService = new FarcasterService();
