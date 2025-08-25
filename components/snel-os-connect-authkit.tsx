'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ConnectButton } from '@/components/wallet/connect-button'
import { FarcasterAuthKit } from '@/components/auth/farcaster-authkit'
import { LensProfileLink } from '@/components/lens/lens-profile-link'
import { useWallet } from '@/hooks/use-wallet'
import { useFarcaster } from '@/hooks/use-farcaster'
import { Wallet, Users, Link2, CheckCircle, Zap } from 'lucide-react'

export function SnelOSConnectAuthKit() {
  const { isConnected, address } = useWallet()
  const { isAuthenticated, profile } = useFarcaster()
  const [lensProfile, setLensProfile] = useState(null)

  const steps = [
    {
      id: 'farcaster',
      title: 'Farcaster Sign In',
      description: 'Automatic in Farcaster mini app, or sign in with QR code',
      icon: Users,
      completed: isAuthenticated,
      priority: true,
      component: (
        <FarcasterAuthKit
          onAuthenticated={(userData) => {
            console.log('Farcaster authenticated:', userData)
          }}
        />
      )
    },
    {
      id: 'wallet',
      title: 'Connect Wallet',
      description: 'Connect your Web3 wallet for Lens linking and transactions',
      icon: Wallet,
      completed: isConnected,
      priority: false,
      component: <ConnectButton />
    },
    {
      id: 'lens',
      title: 'Link Lens Profile',
      description: 'Optional: Connect your Lens Protocol profile',
      icon: Link2,
      completed: !!lensProfile,
      priority: false,
      component: (
        <LensProfileLink
          onLinked={(profile) => setLensProfile(profile)}
        />
      )
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const isInFarcasterApp = typeof window !== 'undefined' && 
    (window.parent !== window || navigator.userAgent.includes('Farcaster'))

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                Welcome to Snel OS
                {isInFarcasterApp && <Zap className="h-6 w-6 text-yellow-500" />}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {isInFarcasterApp 
                  ? 'Running in Farcaster mini app - authentication should be automatic!'
                  : 'Connect your decentralized identity to access the full Snel OS experience'
                }
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {completedSteps}/3 Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Progress Indicator */}
            <div className="flex items-center gap-4 mb-6">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.id} className="flex items-center gap-2">
                    <div className={`
                      p-2 rounded-full border-2 transition-colors relative
                      ${step.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : step.priority
                        ? 'border-blue-500 text-blue-500 bg-blue-50'
                        : 'border-muted-foreground/30 text-muted-foreground'
                      }
                    `}>
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      {step.priority && !step.completed && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        h-0.5 w-16 transition-colors
                        ${steps[index + 1].completed ? 'bg-green-500' : 'bg-muted-foreground/30'}
                      `} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Connection Steps */}
            <Tabs defaultValue="farcaster" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {steps.map((step) => {
                  const Icon = step.icon
                  return (
                    <TabsTrigger 
                      key={step.id} 
                      value={step.id}
                      className="flex items-center gap-2 relative"
                    >
                      <Icon className="h-4 w-4" />
                      {step.title}
                      {step.completed && <CheckCircle className="h-3 w-3 text-green-500" />}
                      {step.priority && !step.completed && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {steps.map((step) => (
                <TabsContent key={step.id} value={step.id} className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <step.icon className="h-5 w-5" />
                        {step.title}
                        {step.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {step.priority && !step.completed && (
                          <Badge variant="default" size="sm">Priority</Badge>
                        )}
                      </CardTitle>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardHeader>
                    <CardContent>
                      {step.component}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            {/* Status Summary */}
            {completedSteps > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Connection Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isAuthenticated && profile && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <div className="flex items-center gap-3">
                        {profile.pfpUrl && (
                          <img src={profile.pfpUrl} alt="" className="w-8 h-8 rounded-full" />
                        )}
                        <div>
                          <p className="font-medium text-blue-900">Farcaster Connected</p>
                          <p className="text-sm text-blue-700">
                            @{profile.username} (FID: {profile.fid})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isConnected && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Wallet Connected</p>
                        <p className="text-sm text-green-700 font-mono">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                      </div>
                    </div>
                  )}

                  {lensProfile && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Lens Profile Linked</p>
                        <p className="text-sm text-purple-700">
                          {lensProfile.handle || lensProfile.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {isAuthenticated && (
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                      <h3 className="font-semibold text-lg text-blue-900">
                        🎉 Welcome to Snel OS!
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your Farcaster identity is connected. 
                        {isConnected && lensProfile 
                          ? ' Full decentralized setup complete!'
                          : ' You can now access core features.'
                        }
                      </p>
                      {isInFarcasterApp && (
                        <p className="text-xs text-blue-600 mt-2 flex items-center justify-center gap-1">
                          <Zap className="h-3 w-3" />
                          Running as Farcaster mini app
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
