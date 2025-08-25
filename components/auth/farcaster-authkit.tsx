'use client'

import { useSignIn, useProfile, SignInButton } from '@farcaster/auth-kit'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, ExternalLink, CheckCircle, Loader2 } from 'lucide-react'

interface FarcasterAuthKitProps {
  onAuthenticated?: (userData: any) => void
}

export function FarcasterAuthKit({ onAuthenticated }: FarcasterAuthKitProps) {
  const {
    signIn,
    signOut,
    connect,
    reconnect,
    isSuccess,
    isError,
    error,
    channelToken,
    url,
    data: signInData,
    validSignature
  } = useSignIn()

  const { isAuthenticated, profile } = useProfile()
  const [isConnecting, setIsConnecting] = useState(false)

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && profile && validSignature) {
      onAuthenticated?.(profile)
    }
  }, [isAuthenticated, profile, validSignature, onAuthenticated])

  // Auto-connect when running in Farcaster mini app
  useEffect(() => {
    const isInFarcasterApp = typeof window !== 'undefined' && 
      (window.parent !== window || navigator.userAgent.includes('Farcaster'))

    if (isInFarcasterApp && !isAuthenticated && !isConnecting) {
      setIsConnecting(true)
      reconnect()
    }
  }, [isAuthenticated, reconnect, isConnecting])

  const handleSignIn = () => {
    setIsConnecting(true)
    signIn()
  }

  const handleConnect = () => {
    if (channelToken) {
      connect()
    }
  }

  const handleSignOut = () => {
    signOut()
    setIsConnecting(false)
  }

  // If authenticated, show profile
  if (isAuthenticated && profile) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            {profile.pfpUrl && (
              <img 
                src={profile.pfpUrl} 
                alt={profile.displayName || profile.username}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {profile.displayName || profile.username}
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardTitle>
              <CardDescription>@{profile.username}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{profile.followerCount || 0} followers</span>
            <span>{profile.followingCount || 0} following</span>
          </div>
          
          {profile.bio && (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              FID: {profile.fid}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://warpcast.com/${profile.username}`, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Profile
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    )
  }

  // If connecting/loading
  if (isConnecting && signInData && !isError) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connecting to Farcaster</CardTitle>
          <CardDescription>
            {url ? 'Scan QR code or click connect in Warpcast' : 'Setting up connection...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          
          {url && (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Or click the button below if you're in Warpcast
              </p>
              <Button 
                onClick={handleConnect}
                className="w-full"
              >
                Connect in Warpcast
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Sign in form
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In with Farcaster</CardTitle>
        <CardDescription>
          Connect your Farcaster account to access Snel OS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error?.message || 'Authentication failed'}
          </div>
        )}
        
        <SignInButton 
          onSuccess={({ fid, username }) => {
            console.log('Signed in as', { fid, username })
          }}
          onError={(error) => {
            console.error('Sign in error:', error)
          }}
        />
        
        {/* Custom sign in button option */}
        <div className="text-center">
          <span className="text-sm text-muted-foreground">or</span>
        </div>
        
        <Button 
          onClick={handleSignIn}
          disabled={isConnecting}
          className="w-full"
          variant="outline"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Custom Sign In'
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          By connecting, you agree to our terms of service and privacy policy.
        </p>
      </CardContent>
    </Card>
  )
}
