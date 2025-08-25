'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ConnectButton } from '@/components/wallet/connect-button'
import { FarcasterAuth } from '@/components/auth/farcaster-auth'
import { LensProfileLink } from '@/components/lens/lens-profile-link'
import { useWallet } from '@/hooks/use-wallet'
import { Wallet, Users, Link2, CheckCircle } from 'lucide-react'

export function SnelOSConnect() {
  const { isConnected, address } = useWallet()
  const [farcasterUser, setFarcasterUser] = useState(null)
  const [lensProfile, setLensProfile] = useState(null)

  const steps = [
    {
      id: 'wallet',
      title: 'Connect Wallet',
      description: 'Connect your Web3 wallet using WalletConnect',
      icon: Wallet,
      completed: isConnected,
      component: <ConnectButton />
    },
    {
      id: 'farcaster',
      title: 'Farcaster Identity',
      description: 'Authenticate with your Farcaster account',
      icon: Users,
      completed: !!farcasterUser,
      component: (
        <FarcasterAuth
          onAuthenticated={(user, token) => {
            setFarcasterUser(user)
            localStorage.setItem('snel_auth_token', token)
          }}
        />
      )
    },
    {
      id: 'lens',
      title: 'Link Lens Profile',
      description: 'Optional: Connect your Lens Protocol profile',
      icon: Link2,
      completed: !!lensProfile,
      component: (
        <LensProfileLink
          onLinked={(profile) => setLensProfile(profile)}
        />
      )
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Welcome to Snel OS</CardTitle>
              <p className="text-muted-foreground mt-2">
                Connect your decentralized identity to access the full Snel OS experience
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
                      p-2 rounded-full border-2 transition-colors
                      ${step.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-muted-foreground/30 text-muted-foreground'
                      }
                    `}>
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
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
            <Tabs defaultValue="wallet" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {steps.map((step) => {
                  const Icon = step.icon
                  return (
                    <TabsTrigger 
                      key={step.id} 
                      value={step.id}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {step.title}
                      {step.completed && <CheckCircle className="h-3 w-3 text-green-500" />}
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

                  {farcasterUser && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Farcaster Connected</p>
                        <p className="text-sm text-blue-700">
                          @{farcasterUser.username} (FID: {farcasterUser.fid})
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

                  {completedSteps === 3 && (
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                      <h3 className="font-semibold text-lg text-green-900">
                        🎉 Welcome to Snel OS!
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your decentralized identity is fully connected. Enjoy the experience!
                      </p>
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
