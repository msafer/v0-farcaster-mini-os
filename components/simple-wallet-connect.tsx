'use client'

import { useWallet } from '@/hooks/use-wallet'
import { useFarcaster } from '@/hooks/use-farcaster'

export function SimpleWalletConnect() {
  const { isConnected, address, openWalletModal, disconnect } = useWallet()
  const { isAuthenticated, profile } = useFarcaster()

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="space-y-4">
      {/* Farcaster Auth Status */}
      <div className="p-4 pixel-border bg-secondary">
        <h3 className="retro-font text-lg mb-2">🎭 Farcaster</h3>
        {isAuthenticated ? (
          <div>
            <p className="text-green-600 text-sm">✅ Connected</p>
            {profile && (
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
            )}
          </div>
        ) : (
          <p className="text-orange-600 text-sm">Not connected</p>
        )}
      </div>

      {/* Wallet Connection */}
      <div className="p-4 pixel-border bg-secondary">
        <h3 className="retro-font text-lg mb-2">🏦 Wallet</h3>
        
        {!isConnected ? (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Connect your Web3 wallet for Lens linking and transactions
            </p>
            <button
              onClick={openWalletModal}
              className="w-full p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            <p className="text-green-600 text-sm mb-2">✅ Wallet Connected</p>
            <p className="text-xs text-muted-foreground mb-3 font-mono">
              {shortenAddress(address!)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={openWalletModal}
                className="flex-1 p-2 text-xs bg-secondary border rounded hover:bg-accent transition-colors"
              >
                Manage
              </button>
              <button
                onClick={() => disconnect()}
                className="flex-1 p-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 pixel-border bg-secondary">
        <h3 className="retro-font text-lg mb-2">⚡ Quick Actions</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Farcaster:</span>
            <span className={isAuthenticated ? "text-green-600" : "text-orange-600"}>
              {isAuthenticated ? "Ready" : "Setup needed"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Wallet:</span>
            <span className={isConnected ? "text-green-600" : "text-orange-600"}>
              {isConnected ? "Ready" : "Setup needed"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Lens:</span>
            <span className="text-gray-500">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
