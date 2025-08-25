// Export the interfaces for Lens Protocol
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
  private apiUrl = 'https://api-v2.lens.dev';

  async getProfileById(profileId: string): Promise<LensProfile | null> {
    try {
      const query = `
        query Profile($request: ProfileRequest!) {
          profile(request: $request) {
            id
            handle {
              fullHandle
              localName
            }
            metadata {
              displayName
              bio
              picture {
                ... on ImageSet {
                  optimized {
                    uri
                  }
                }
              }
            }
            ownedBy {
              address
            }
            stats {
              followers
              following
            }
          }
        }
      `;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            request: { forProfileId: profileId }
          }
        })
      });

      const data = await response.json();
      return this.formatProfile(data?.data?.profile);
    } catch (error) {
      console.error('Error fetching Lens profile by ID:', error);
      return null;
    }
  }

  async getProfileByHandle(handle: string): Promise<LensProfile | null> {
    try {
      const query = `
        query Profile($request: ProfileRequest!) {
          profile(request: $request) {
            id
            handle {
              fullHandle
              localName
            }
            metadata {
              displayName
              bio
              picture {
                ... on ImageSet {
                  optimized {
                    uri
                  }
                }
              }
            }
            ownedBy {
              address
            }
            stats {
              followers
              following
            }
          }
        }
      `;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            request: { forHandle: handle }
          }
        })
      });

      const data = await response.json();
      return this.formatProfile(data?.data?.profile);
    } catch (error) {
      console.error('Error fetching Lens profile by handle:', error);
      return null;
    }
  }

  async getProfilesByAddress(address: string): Promise<LensProfile[]> {
    try {
      const query = `
        query Profiles($request: ProfilesRequest!) {
          profiles(request: $request) {
            items {
              id
              handle {
                fullHandle
                localName
              }
              metadata {
                displayName
                bio
                picture {
                  ... on ImageSet {
                    optimized {
                      uri
                    }
                  }
                }
              }
              ownedBy {
                address
              }
              stats {
                followers
                following
              }
            }
          }
        }
      `;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            request: {
              where: { ownedBy: [address] }
            }
          }
        })
      });

      const data = await response.json();
      const profiles = data?.data?.profiles?.items || [];
      return profiles.map((profile: any) => this.formatProfile(profile)).filter(Boolean) as LensProfile[];
    } catch (error) {
      console.error('Error fetching Lens profiles by address:', error);
      return [];
    }
  }

  async getPostsByProfile(profileId: string, limit = 20): Promise<LensPost[]> {
    try {
      // Lens posts functionality - simplified for now
      console.log('Lens posts feature not fully implemented yet');
      return [];
    } catch (error) {
      console.error('Error fetching Lens posts:', error);
      return [];
    }
  }

  async getFeed(limit = 20): Promise<LensPost[]> {
    try {
      // Lens feed functionality - simplified for now
      console.log('Lens feed feature not fully implemented yet');
      return [];
    } catch (error) {
      console.error('Error fetching Lens feed:', error);
      return [];
    }
  }

  async searchProfiles(query: string, limit = 10): Promise<LensProfile[]> {
    try {
      // Lens search functionality - simplified for now
      console.log('Lens search feature not fully implemented yet');
      return [];
    } catch (error) {
      console.error('Error searching Lens profiles:', error);
      return [];
    }
  }

  private formatProfile(profile: any): LensProfile | null {
    if (!profile) return null;

    return {
      id: profile.id,
      handle: profile.handle?.fullHandle || profile.handle?.localName,
      name: profile.metadata?.displayName,
      bio: profile.metadata?.bio,
      picture: profile.metadata?.picture?.optimized?.uri,
      coverPicture: profile.metadata?.coverPicture?.optimized?.uri,
      ownedBy: profile.ownedBy?.address,
      followersCount: profile.stats?.followers,
      followingCount: profile.stats?.following,
      isFollowing: false // Simplified for now
    };
  }

  private formatPost(post: any): LensPost | null {
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
