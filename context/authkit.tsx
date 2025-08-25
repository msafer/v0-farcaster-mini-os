"use client"

import { AuthKitProvider } from "@farcaster/auth-kit"
import type { ReactNode } from "react"

const config = {
  // For a relay, pass the URL
  relay: "https://relay.farcaster.xyz",
  // For self-hosted, pass the domain
  // domain: 'example.farcaster.xyz',

  // Optional: Set to true for development
  debug: process.env.NODE_ENV === "development",
}

interface AuthKitContextProviderProps {
  children: ReactNode
}

export default function AuthKitContextProvider({ children }: AuthKitContextProviderProps) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>
}
