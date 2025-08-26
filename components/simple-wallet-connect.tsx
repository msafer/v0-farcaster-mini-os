'use client'

import { useWallet } from '@/hooks/use-wallet'
import { useFarcaster } from '@/hooks/use-farcaster'

export function SimpleWalletConnect() {
  const { isConnected, address, openWalletModal, disconnect, connect, connectors, isModalOpen, closeWalletModal } = useWallet()
  const { isAuthenticated, profile } = useFarcaster()

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="space-y-4 relative">
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
              onClick={(e) => {
                console.log("Connect wallet button clicked");
                e.preventDefault();
                e.stopPropagation();
                openWalletModal();
              }}
              onTouchStart={(e) => {
                console.log("Connect wallet touch start");
                e.preventDefault();
                e.stopPropagation();
                openWalletModal();
              }}
              className="w-full p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors touch-target"
              style={{ touchAction: 'manipulation' }}
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

      {/* Wallet Connection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 pixel-border max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="retro-font text-lg">Connect Wallet</h3>
              <button
                onClick={closeWalletModal}
                className="text-xl hover:text-red-500"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    console.log("Connecting with:", connector.name);
                    connect(connector.id);
                  }}
                  className="w-full p-3 text-left pixel-border bg-secondary hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{connector.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {connector.type}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground">
              By connecting a wallet, you agree to the Terms of Service and Privacy Policy.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
