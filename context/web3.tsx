"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createConfig, http, WagmiProvider } from "wagmi"
import { mainnet, arbitrum, base, scroll, polygon } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"
import type { ReactNode } from "react"

const queryClient = new QueryClient()

const projectId = "4f196d627335b92874cb5b398121d116"

const config = createConfig({
  chains: [mainnet, arbitrum, base, scroll, polygon],
  connectors: [
    injected(),
    walletConnect({
      projectId,
      metadata: {
        name: "Snel OS",
        description: "A decentralized social OS built on Farcaster and Lens",
        url: typeof window !== "undefined" ? window.location.origin : "https://snel-os.vercel.app",
        icons: ["https://avatars.githubusercontent.com/u/179229932"],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [scroll.id]: http(),
    [polygon.id]: http(),
  },
})

function Web3ContextProvider({
  children,
}: {
  children: ReactNode
  cookies?: string | null
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default Web3ContextProvider
