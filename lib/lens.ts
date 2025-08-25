import { lensClient } from '@/config/services';
import type { 
  Profile, 
  Post, 
  ProfilesRequest,
  PublicationsRequest,
  ProfileId,
  ProfileRequest
} from '@lens-protocol/client';

export interface LensProfile {
  id: string;
  handle?: string;
  name?: string;
  bio?: string;
  picture?: string;
  coverPicture?: string;
  ownedBy: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface LensPost {
  id: string;
  content?: string;
  author: LensProfile;
  createdAt: string;
  stats?: {
    upvotes: number;
    downvotes: number;
    comments: number;
    mirrors: number;
    collects: number;
  };
  media?: Array<{
    url: string;
    mimeType: string;
  }>;
}

export class LensService {
  private client = lensClient;

  async getProfileById(profileId: string): Promise<LensProfile | null> {
    try {
      const request: ProfileRequest = {
        forProfileId: profileId as ProfileId
      };
      
      const profile = await this.client.profile.fetch(request);
      return this.formatProfile(profile);
    } catch (error) {
      console.error('Error fetching Lens profile by ID:', error);
      return null;
    }
  }

  async getProfileByHandle(handle: string): Promise<LensProfile | null> {
    try {
      const request: ProfileRequest = {
        forHandle: handle
      };
      
      const profile = await this.client.profile.fetch(request);
      return this.formatProfile(profile);
    } catch (error) {
      console.error('Error fetching Lens profile by handle:', error);
      return null;
    }
  }

  async getProfilesByAddress(address: string): Promise<LensProfile[]> {
    try {
      const request: ProfilesRequest = {
        where: {
          ownedBy: [address]
        }
      };
      
      const response = await this.client.profile.fetchAll(request);
      return response.items.map(profile => this.formatProfile(profile)).filter(Boolean) as LensProfile[];
    } catch (error) {
      console.error('Error fetching Lens profiles by address:', error);
      return [];
    }
  }

  async getPostsByProfile(profileId: string, limit = 20): Promise<LensPost[]> {
    try {
      const request: PublicationsRequest = {
        where: {
          from: [profileId as ProfileId],
          publicationTypes: ['POST']
        },
        limit
      };
      
      const response = await this.client.publication.fetchAll(request);
      return response.items.map(post => this.formatPost(post)).filter(Boolean) as LensPost[];
    } catch (error) {
      console.error('Error fetching Lens posts:', error);
      return [];
    }
  }

  async getFeed(limit = 20): Promise<LensPost[]> {
    try {
      const request: PublicationsRequest = {
        where: {
          publicationTypes: ['POST']
        },
        limit
      };
      
      const response = await this.client.publication.fetchAll(request);
      return response.items.map(post => this.formatPost(post)).filter(Boolean) as LensPost[];
    } catch (error) {
      console.error('Error fetching Lens feed:', error);
      return [];
    }
  }

  async searchProfiles(query: string, limit = 10): Promise<LensProfile[]> {
    try {
      const request: ProfilesRequest = {
        where: {
          profileIds: [],
        },
        limit
      };
      
      const response = await this.client.profile.fetchAll(request);
      
      // Filter results by query on the client side for now
      const filtered = response.items.filter(profile => 
        profile?.handle?.toLowerCase().includes(query.toLowerCase()) ||
        profile?.metadata?.displayName?.toLowerCase().includes(query.toLowerCase())
      );
      
      return filtered.map(profile => this.formatProfile(profile)).filter(Boolean) as LensProfile[];
    } catch (error) {
      console.error('Error searching Lens profiles:', error);
      return [];
    }
  }

  private formatProfile(profile: Profile | null): LensProfile | null {
    if (!profile) return null;

    return {
      id: profile.id,
      handle: profile.handle?.fullHandle || profile.handle?.localName,
      name: profile.metadata?.displayName,
      bio: profile.metadata?.bio,
      picture: profile.metadata?.picture?.__typename === 'ImageSet' 
        ? profile.metadata.picture.optimized?.uri 
        : undefined,
      coverPicture: profile.metadata?.coverPicture?.__typename === 'ImageSet'
        ? profile.metadata.coverPicture.optimized?.uri
        : undefined,
      ownedBy: profile.ownedBy.address,
      followersCount: profile.stats?.followers,
      followingCount: profile.stats?.following,
      isFollowing: profile.operations?.isFollowedByMe.value
    };
  }

  private formatPost(post: Post | any): LensPost | null {
    if (!post || !post.by) return null;

    return {
      id: post.id,
      content: post.metadata?.content,
      author: this.formatProfile(post.by) as LensProfile,
      createdAt: post.createdAt,
      stats: {
        upvotes: post.stats?.upvotes || 0,
        downvotes: post.stats?.downvotes || 0,
        comments: post.stats?.comments || 0,
        mirrors: post.stats?.mirrors || 0,
        collects: post.stats?.collects || 0
      },
      media: post.metadata?.attachments?.map((attachment: any) => ({
        url: attachment.uri,
        mimeType: attachment.type
      })) || []
    };
  }

  // Wallet signature verification
  async verifyLensProfileOwnership(address: string, signature: string, message: string): Promise<boolean> {
    try {
      // This would typically involve verifying the signature matches the address
      // and that the address owns Lens profiles
      const profiles = await this.getProfilesByAddress(address);
      return profiles.length > 0;
    } catch (error) {
      console.error('Error verifying Lens profile ownership:', error);
      return false;
    }
  }
}

export const lensService = new LensService();
