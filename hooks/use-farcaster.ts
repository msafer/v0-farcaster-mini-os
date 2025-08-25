'use client'

import { useSignIn, useProfile } from '@farcaster/auth-kit'
import { useState, useEffect } from 'react'
import { BACKEND_URL } from '@/config/services'

export function useFarcaster() {
  const { isAuthenticated, profile } = useProfile()
  const signInHook = useSignIn()
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load auth token from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('snel_auth_token')
      setAuthToken(token)
    }
  }, [])

  // Handle Farcaster authentication success
  useEffect(() => {
    if (isAuthenticated && profile && signInHook.validSignature && !authToken) {
      handleAuthSuccess()
    }
  }, [isAuthenticated, profile, signInHook.validSignature, authToken])

  const handleAuthSuccess = async () => {
    if (!profile || !signInHook.data) return

    setIsLoading(true)
    setError(null)

    try {
      // Send the Farcaster auth data to our backend
      const response = await fetch(`${BACKEND_URL}/auth/fc/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid: profile.fid,
          username: profile.username,
          displayName: profile.displayName,
          pfpUrl: profile.pfpUrl,
          bio: profile.bio,
          signature: signInHook.data,
          message: signInHook.message
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Backend authentication failed')
      }

      const data = await response.json()
      
      // Store the backend auth token
      setAuthToken(data.token)
      localStorage.setItem('snel_auth_token', data.token)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    signInHook.signOut()
    setAuthToken(null)
    localStorage.removeItem('snel_auth_token')
    setError(null)
  }

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    if (!authToken) {
      throw new Error('Not authenticated')
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${authToken}`,
      },
    })
  }

  return {
    // Auth state
    isAuthenticated: isAuthenticated && !!authToken,
    profile,
    authToken,
    isLoading,
    error,

    // Auth methods
    signIn: signInHook.signIn,
    signOut,
    connect: signInHook.connect,
    reconnect: signInHook.reconnect,

    // Helper methods
    makeAuthenticatedRequest,

    // Raw AuthKit data
    signInData: signInHook.data,
    validSignature: signInHook.validSignature,
    url: signInHook.url,
    channelToken: signInHook.channelToken,
    isSuccess: signInHook.isSuccess,
    isError: signInHook.isError,
  }
}
