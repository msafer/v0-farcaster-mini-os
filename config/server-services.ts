import type { NeynarAPIClient } from "@neynar/nodejs-sdk"
import { Configuration } from "@neynar/nodejs-sdk"

// Neynar Configuration (server-only)
export const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || process.env.NEYNAR_API_KEY

// Server-only Neynar client
export let neynarClient: NeynarAPIClient | null = null

if (NEYNAR_API_KEY) {
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

export const SIGNER_UUID = process.env.NEXT_PUBLIC_FARCASTER_SIGNER_UUID

// Server-side checks
if (!NEYNAR_API_KEY) {
  console.warn("NEYNAR_API_KEY is not configured. Farcaster features will be limited.")
}
