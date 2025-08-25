'use client'

import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useState, useCallback } from 'react'
import { lensService } from '@/lib/lens'

export function useWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const { open, close } = useAppKit()
  
  const [isLinking, setIsLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  const openWalletModal = useCallback(() => {
    open()
  }, [open])

  const closeWalletModal = useCallback(() => {
    close()
  }, [close])

  const linkLensProfile = useCallback(async () => {
    if (!address) {
      setLinkError('No wallet connected')
      return { success: false, error: 'No wallet connected' }
    }

    setIsLinking(true)
    setLinkError(null)

    try {
      // Create message to sign
      const message = `Link Lens profile for wallet: ${address}\nTimestamp: ${Date.now()}`
      
      // Sign the message
      const signature = await signMessageAsync({ message })

      // Verify Lens profile ownership
      const hasLensProfile = await lensService.verifyLensProfileOwnership(address, signature, message)
      
      if (!hasLensProfile) {
        throw new Error('No Lens profile found for this wallet')
      }

      // Get the Lens profiles for this address
      const profiles = await lensService.getProfilesByAddress(address)
      const primaryProfile = profiles[0] // Use the first profile

      if (!primaryProfile) {
        throw new Error('No Lens profile found for this wallet')
      }

      // Send to backend to link the profile
      const response = await fetch('/api/link/lens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message,
          lensProfile: primaryProfile.handle
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to link Lens profile')
      }

      setIsLinking(false)
      return { success: true, profile: primaryProfile }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setLinkError(errorMessage)
      setIsLinking(false)
      return { success: false, error: errorMessage }
    }
  }, [address, signMessageAsync])

  return {
    // Wallet state
    address,
    isConnected,
    chainId,
    
    // Connection methods
    connect,
    disconnect,
    connectors,
    
    // Modal controls
    openWalletModal,
    closeWalletModal,
    
    // Lens linking
    linkLensProfile,
    isLinking,
    linkError,
    
    // Signing
    signMessage: signMessageAsync
  }
}
