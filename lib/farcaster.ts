export interface FarcasterUser {
  fid: number
  username: string
  display_name: string
  pfp_url?: string
  profile?: {
    bio?: {
      text: string
    }
  }
  follower_count?: number
  following_count?: number
}

export interface FarcasterCast {
  hash: string
  parent_hash?: string
  parent_url?: string
  root_parent_url?: string
  parent_author?: {
    fid: number
    username: string
  }
  author: FarcasterUser
  text: string
  timestamp: string
  embeds?: Array<{
    url?: string
    cast_id?: {
      fid: number
      hash: string
    }
  }>
  reactions?: {
    likes?: Array<{
      fid: number
      fname: string
    }>
    recasts?: Array<{
      fid: number
      fname: string
    }>
  }
  replies?: {
    count: number
  }
}

export class FarcasterService {
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`/api/farcaster${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getUserByFid(fid: number): Promise<FarcasterUser | null> {
    try {
      const data = await this.apiCall(`/user/${fid}`)
      return data.user || null
    } catch (error) {
      console.error("Error fetching user by FID:", error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<FarcasterUser | null> {
    try {
      const data = await this.apiCall(`/user/username/${username}`)
      return data.user || null
    } catch (error) {
      console.error("Error fetching user by username:", error)
      return null
    }
  }

  async getCastsByFid(fid: number, limit = 25): Promise<FarcasterCast[]> {
    try {
      const data = await this.apiCall(`/casts/${fid}?limit=${limit}`)
      return data.casts || []
    } catch (error) {
      console.error("Error fetching casts:", error)
      return []
    }
  }

  async getFeed(fid: number, limit = 25): Promise<FarcasterCast[]> {
    try {
      const data = await this.apiCall(`/feed/${fid}?limit=${limit}`)
      return data.casts || []
    } catch (error) {
      console.error("Error fetching feed:", error)
      return []
    }
  }

  async publishCast(
    signerUuid: string,
    text: string,
    parentUrl?: string,
    embeds?: Array<{ url: string }>,
  ): Promise<{ success: boolean; cast?: any; error?: string }> {
    try {
      const data = await this.apiCall("/cast", {
        method: "POST",
        body: JSON.stringify({
          signerUuid,
          text,
          parentUrl,
          embeds,
        }),
      })
      return { success: true, cast: data.cast }
    } catch (error) {
      console.error("Error publishing cast:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async likeCast(signerUuid: string, targetHash: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.apiCall("/react", {
        method: "POST",
        body: JSON.stringify({
          signerUuid,
          type: "like",
          targetHash,
        }),
      })
      return { success: true }
    } catch (error) {
      console.error("Error liking cast:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async recastCast(signerUuid: string, targetHash: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.apiCall("/react", {
        method: "POST",
        body: JSON.stringify({
          signerUuid,
          type: "recast",
          targetHash,
        }),
      })
      return { success: true }
    } catch (error) {
      console.error("Error recasting:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async searchUsers(query: string, limit = 10): Promise<FarcasterUser[]> {
    try {
      const data = await this.apiCall(`/search/users?q=${encodeURIComponent(query)}&limit=${limit}`)
      return data.users || []
    } catch (error) {
      console.error("Error searching users:", error)
      return []
    }
  }

  // OAuth helpers
  static generateAuthUrl(): string {
    const { FARCASTER_CONFIG } = require("@/config/services")
    if (!FARCASTER_CONFIG.clientId || !FARCASTER_CONFIG.redirectUri) {
      throw new Error("Farcaster OAuth not configured")
    }

    const params = new URLSearchParams({
      client_id: FARCASTER_CONFIG.clientId,
      response_type: "code",
      redirect_uri: FARCASTER_CONFIG.redirectUri,
      scope: "read write",
    })

    return `https://warpcast.com/~/oauth/authorize?${params.toString()}`
  }
}

export const farcasterService = new FarcasterService()
