"use client"

import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi"
import { useState, useCallback } from "react"

export function useWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()

  const [isLinking, setIsLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openWalletModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const closeWalletModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const connectWallet = useCallback(
    (connectorId?: string) => {
      const connector = connectorId ? connectors.find((c) => c.id === connectorId) : connectors[0]

      if (connector) {
        connect({ connector })
        setIsModalOpen(false)
      }
    },
    [connect, connectors],
  )

  const linkLensProfile = useCallback(async () => {
    if (!address) {
      setLinkError("No wallet connected")
      return { success: false, error: "No wallet connected" }
    }

    setIsLinking(true)
    setLinkError(null)

    try {
      const message = `Link Lens profile for wallet: ${address}\nTimestamp: ${Date.now()}`
      const signature = await signMessageAsync({ message })

      setIsLinking(false)
      return { success: true, profile: { handle: "lens-user" } }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setLinkError(errorMessage)
      setIsLinking(false)
      return { success: false, error: errorMessage }
    }
  }, [address, signMessageAsync])

  return {
    address,
    isConnected,
    chainId,
    connect: connectWallet,
    disconnect,
    connectors,
    openWalletModal,
    closeWalletModal,
    isModalOpen,
    linkLensProfile,
    isLinking,
    linkError,
    signMessage: signMessageAsync,
  }
}
