// Service URLs for client-side use only
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

// Farcaster App Configuration (client-safe)
export const FARCASTER_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_FARCASTER_CLIENT_ID,
  redirectUri: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "",
}

// Client-side checks
if (typeof window !== "undefined") {
  if (!FARCASTER_CONFIG.clientId) {
    console.warn("FARCASTER_CLIENT_ID is not configured. Authentication will be limited.")
  }
}
