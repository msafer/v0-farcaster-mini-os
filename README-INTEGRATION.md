# 🔗 Snel OS Integration Guide

This document explains how to use the WalletConnect, Neynar (Farcaster), and Lens Protocol integrations in Snel OS.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory:

\`\`\`bash
# Copy from .env.local.example
cp .env.local.example .env.local
\`\`\`

Then fill in your API keys:

\`\`\`env
# WalletConnect/Reown (Already configured)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=4f196d627335b92874cb5b398121d116

# Neynar (Farcaster API) - Get from https://docs.neynar.com
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_api_key

# Farcaster OAuth - Set up at https://warpcast.com/~/developers
NEXT_PUBLIC_FARCASTER_CLIENT_ID=your_farcaster_client_id
NEXT_PUBLIC_FARCASTER_SIGNER_UUID=your_farcaster_signer_uuid

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
\`\`\`

### 2. Backend Setup

Configure the backend with API keys in `backend/.env`:

\`\`\`env
# Neynar API
NEYNAR_API_KEY=your_neynar_api_key

# Farcaster OAuth
FARCASTER_CLIENT_ID=your_farcaster_client_id
FARCASTER_CLIENT_SECRET=your_farcaster_client_secret
FARCASTER_REDIRECT_URI=http://localhost:3000/auth/callback
\`\`\`

## 🔌 Integration Overview

### WalletConnect (Reown) - ✅ Configured

- **Project ID**: `4f196d627335b92874cb5b398121d116`
- **Networks**: Mainnet, Arbitrum, Base, Scroll, Polygon
- **Features**: Email auth, social logins, dark theme
- **Usage**: `useWallet()` hook, `<ConnectButton />` component

### Neynar (Farcaster API) - ✅ Configured

- **API Base**: `https://api.neynar.com`
- **Authentication**: API key based
- **Features**: User data, casts, feeds, social graph
- **Usage**: `farcasterService` class, `<FarcasterAuth />` component

### Lens Protocol - ✅ Configured

- **API Base**: `https://api-v2.lens.dev/`
- **Environment**: Development (switch to production when ready)
- **Features**: Profile resolution, wallet verification
- **Usage**: `lensService` class, `<LensProfileLink />` component

## 🎯 Key Components

### 1. Complete Integration Flow

\`\`\`tsx
import { SnelOSConnect } from '@/components/snel-os-connect'

// Full integration with all three services
<SnelOSConnect />
\`\`\`

### 2. Individual Components

\`\`\`tsx
// Wallet connection
import { ConnectButton } from '@/components/wallet/connect-button'
<ConnectButton />

// Farcaster authentication
import { FarcasterAuth } from '@/components/auth/farcaster-auth'
<FarcasterAuth onAuthenticated={(user, token) => {}} />

// Lens profile linking
import { LensProfileLink } from '@/components/lens/lens-profile-link'
<LensProfileLink onLinked={(profile) => {}} />
\`\`\`

### 3. Hooks

\`\`\`tsx
import { useWallet } from '@/hooks/use-wallet'

function MyComponent() {
  const {
    // Wallet state
    address,
    isConnected,
    chainId,
    
    // Connection methods
    connect,
    disconnect,
    openWalletModal,
    
    // Lens linking
    linkLensProfile,
    isLinking,
    linkError,
    
    // Signing
    signMessage
  } = useWallet()
}
\`\`\`

## 📡 API Services

### Farcaster Service

\`\`\`tsx
import { farcasterService } from '@/lib/farcaster'

// Get user by FID
const user = await farcasterService.getUserByFid(123)

// Get user by username
const user = await farcasterService.getUserByUsername('username')

// Get user's casts
const casts = await farcasterService.getCastsByFid(123)

// Get feed
const feed = await farcasterService.getFeed(123)

// Publish cast (requires signer)
const result = await farcasterService.publishCast(signerUuid, 'Hello Farcaster!')

// Search users
const users = await farcasterService.searchUsers('query')
\`\`\`

### Lens Service

\`\`\`tsx
import { lensService } from '@/lib/lens'

// Get profile by handle
const profile = await lensService.getProfileByHandle('username.lens')

// Get profiles by wallet address
const profiles = await lensService.getProfilesByAddress('0x...')

// Get posts by profile
const posts = await lensService.getPostsByProfile('profile-id')

// Get public feed
const feed = await lensService.getFeed()

// Search profiles
const profiles = await lensService.searchProfiles('query')
\`\`\`

## 🔑 Authentication Flow

### 1. User Journey

1. **Connect Wallet** → WalletConnect modal opens, user connects wallet
2. **Farcaster Auth** → OAuth flow to Warpcast, returns with user data
3. **Link Lens Profile** → Optional wallet signature to verify Lens ownership

### 2. Backend Integration

The frontend automatically communicates with your backend:

- `POST /api/auth/fc/callback` → Forwards to `backend/auth/fc/callback`
- `POST /api/link/lens` → Forwards to `backend/link/lens`

### 3. Data Flow

\`\`\`
Frontend Components → API Routes → Backend Services → Database
                                ↘ External APIs (Neynar, Lens)
\`\`\`

## 🎨 UI Components

All components use your existing design system:

- **Styling**: Tailwind CSS with shadcn/ui
- **Theme**: Supports dark/light mode
- **Responsive**: Mobile-friendly design
- **Accessible**: ARIA compliant

## 🔧 Configuration

### WalletConnect Features

\`\`\`tsx
// In context/web3.tsx
const modal = createAppKit({
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'apple'],
    emailShowWallets: true
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#00DCFF',
    '--w3m-color-mix-strength': 20
  }
})
\`\`\`

### Network Configuration

\`\`\`tsx
// In config/wagmi.ts
export const networks = [mainnet, arbitrum, base, scroll, polygon]
\`\`\`

## 🚨 Error Handling

All services include comprehensive error handling:

\`\`\`tsx
// Example error handling
try {
  const result = await farcasterService.publishCast(signer, text)
  if (!result.success) {
    console.error('Cast failed:', result.error)
  }
} catch (error) {
  console.error('Service error:', error.message)
}
\`\`\`

## 📖 API Documentation

- **Neynar**: [https://docs.neynar.com/reference/quickstart](https://docs.neynar.com/reference/quickstart)
- **Lens Protocol**: [https://lens.xyz/docs/protocol](https://lens.xyz/docs/protocol)
- **WalletConnect**: [https://docs.reown.com/appkit/next/core/installation](https://docs.reown.com/appkit/next/core/installation)

## 🎯 Next Steps

1. **Get API Keys**: Sign up for Neynar and Farcaster developer accounts
2. **Configure Environment**: Add your API keys to `.env.local`
3. **Test Integration**: Use the `<SnelOSConnect />` component
4. **Customize**: Modify components to match your design
5. **Deploy**: Update production environment variables

## 🤝 Support

- Check component props and TypeScript types for detailed API
- All services include fallback handling for missing API keys
- Components gracefully degrade when services are unavailable

---

**Ready to connect the decentralized web!** 🌐
