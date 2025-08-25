'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, ExternalLink } from 'lucide-react'
import { FarcasterService } from '@/lib/farcaster'

interface FarcasterUser {
  fid: number
  username: string
  display_name: string
  pfp_url?: string
  follower_count?: number
  following_count?: number
}

interface FarcasterAuthProps {
  onAuthenticated?: (user: FarcasterUser, token: string) => void
}

export function FarcasterAuth({ onAuthenticated }: FarcasterAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check for OAuth callback on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code && !user) {
      handleFarcasterCallback(code)
    }
  }, [user])

  const handleFarcasterLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Generate Farcaster OAuth URL
      const authUrl = FarcasterService.generateAuthUrl()
      
      // Redirect to Farcaster OAuth
      window.location.href = authUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
      setIsLoading(false)
    }
  }

  const handleFarcasterCallback = async (code: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Exchange code for user session via backend
      const response = await fetch('/api/auth/fc/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Authentication failed')
      }

      const data = await response.json()
      setUser(data.user)
      
      // Store auth token
      localStorage.setItem('snel_auth_token', data.token)
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
      
      // Notify parent component
      onAuthenticated?.(data.user, data.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('snel_auth_token')
  }

  if (user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            {user.pfp_url && (
              <img 
                src={user.pfp_url} 
                alt={user.display_name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <CardTitle className="text-lg">{user.display_name}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{user.follower_count || 0} followers</span>
            <span>{user.following_count || 0} following</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              FID: {user.fid}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://warpcast.com/${user.username}`, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Profile
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connect with Farcaster</CardTitle>
        <CardDescription>
          Sign in with your Farcaster account to access Snel OS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        <Button 
          onClick={handleFarcasterLogin}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Sign in with Farcaster'
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          By connecting, you agree to our terms of service and privacy policy.
        </p>
      </CardContent>
    </Card>
  )
}
