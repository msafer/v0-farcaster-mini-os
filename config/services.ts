import type { NeynarAPIClient } from "@neynar/nodejs-sdk"
import { Configuration } from "@neynar/nodejs-sdk"

// Neynar Configuration
export const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || process.env.NEYNAR_API_KEY

// Only instantiate Neynar client server-side
export let neynarClient: NeynarAPIClient | null = null

if (typeof window === "undefined" && NEYNAR_API_KEY) {
  // Server-side only - dynamically import and instantiate
  import("@neynar/nodejs-sdk")
    .then(({ NeynarAPIClient }) => {
      neynarClient = new NeynarAPIClient(
        new Configuration({
          apiKey: NEYNAR_API_KEY,
          baseOptions: {
            headers: {
              "x-neynar-experimental": true,
            },
          },
        }),
      )
    })
    .catch((error) => {
      console.error("Failed to initialize Neynar client:", error)
    })
}

// Lens Configuration
export const lensClient = null // Will be initialized client-side only

// Service URLs
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

// Farcaster App Configuration
export const FARCASTER_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_FARCASTER_CLIENT_ID,
  redirectUri: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "",
}

export const SIGNER_UUID = process.env.NEXT_PUBLIC_FARCASTER_SIGNER_UUID

// Error handling for missing configurations
if (typeof window === "undefined") {
  // Server-side checks
  if (!NEYNAR_API_KEY) {
    console.warn("NEYNAR_API_KEY is not configured. Farcaster features will be limited.")
  }
} else {
  // Client-side checks
  if (!FARCASTER_CONFIG.clientId) {
    console.warn("FARCASTER_CLIENT_ID is not configured. Authentication will be limited.")
  }
}
