'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/use-wallet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Link2, CheckCircle, AlertCircle } from 'lucide-react'

interface LensProfile {
  id: string
  handle?: string
  name?: string
  bio?: string
  picture?: string
  ownedBy: string
}

interface LensProfileLinkProps {
  onLinked?: (profile: LensProfile) => void
  className?: string
}

export function LensProfileLink({ onLinked, className }: LensProfileLinkProps) {
  const { address, isConnected, linkLensProfile, isLinking, linkError } = useWallet()
  const [linkedProfile, setLinkedProfile] = useState<LensProfile | null>(null)
  const [success, setSuccess] = useState(false)

  const handleLinkProfile = async () => {
    const result = await linkLensProfile()
    
    if (result.success && result.profile) {
      setLinkedProfile(result.profile)
      setSuccess(true)
      onLinked?.(result.profile)
    }
  }

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Link Lens Profile
          </CardTitle>
          <CardDescription>
            Connect your wallet first to link your Lens profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full">
            Connect Wallet First
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (success && linkedProfile) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Lens Profile Linked
          </CardTitle>
          <CardDescription>
            Your Lens profile has been successfully linked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {linkedProfile.picture && (
              <img 
                src={linkedProfile.picture} 
                alt={linkedProfile.name || linkedProfile.handle}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{linkedProfile.name || linkedProfile.handle}</p>
              {linkedProfile.handle && (
                <p className="text-sm text-muted-foreground">@{linkedProfile.handle}</p>
              )}
            </div>
          </div>
          
          {linkedProfile.bio && (
            <p className="text-sm text-muted-foreground">{linkedProfile.bio}</p>
          )}
          
          <Badge variant="secondary" className="w-fit">
            Verified Lens Profile
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Link Lens Profile
        </CardTitle>
        <CardDescription>
          Connect your Lens profile to enhance your Snel OS experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {linkError && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {linkError}
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Connected wallet: <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            We'll verify that this wallet owns a Lens profile and link it to your account.
          </p>
        </div>
        
        <Button 
          onClick={handleLinkProfile}
          disabled={isLinking}
          className="w-full"
        >
          {isLinking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Linking Profile...
            </>
          ) : (
            <>
              <Link2 className="mr-2 h-4 w-4" />
              Link Lens Profile
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          This will require signing a message to verify wallet ownership.
        </p>
      </CardContent>
    </Card>
  )
}
