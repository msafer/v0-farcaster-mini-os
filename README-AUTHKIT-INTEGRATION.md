# 🔐 Farcaster AuthKit Integration

This document explains the updated Farcaster integration using the official AuthKit for seamless authentication.

## ✨ What's New

### 🚀 **Automatic Authentication in Farcaster Mini Apps**
- **Zero-click** authentication when running inside Farcaster
- **QR Code** authentication for external web access
- **Real-time** profile syncing with Neynar API

### 🔧 **Official AuthKit Integration**
- Uses `@farcaster/auth-kit` for standardized Sign In With Farcaster
- Follows [Farcaster AuthKit documentation](https://docs.farcaster.xyz/auth-kit/)
- Integrates with [Warpcast API](https://docs.farcaster.xyz/reference/warpcast/api)

## 🛠 Setup

### 1. Environment Configuration

**Frontend (`.env.local`):**
\`\`\`env
# Neynar API (configured with your key)
NEXT_PUBLIC_NEYNAR_API_KEY=E72DB815-4C11-4191-B39B-66223FB06814

# Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
\`\`\`

**Backend (`backend/.env`):**
\`\`\`env
# Neynar API
NEYNAR_API_KEY=E72DB815-4C11-4191-B39B-66223FB06814
\`\`\`

### 2. Updated Components

#### **`<SnelOSConnectAuthKit />`** - Complete Integration
- Prioritizes Farcaster authentication first
- Detects Farcaster mini app environment
- Automatic reconnection for seamless UX

#### **`<FarcasterAuthKit />`** - Auth Component  
- Official AuthKit `<SignInButton />` integration
- Custom UI with automatic app detection
- Profile display with Neynar verification

#### **`useFarcaster()`** - React Hook
- Manages AuthKit state and backend sync
- Automatic token storage and retrieval
- Authenticated API request helper

## 🔄 Authentication Flow

### In Farcaster Mini App:
1. **Auto-detect** Farcaster environment
2. **Auto-connect** using AuthKit
3. **Sync** profile data with backend
4. **Ready** to use immediately

### On External Web:
1. **Show** "Sign In with Farcaster" button
2. **Generate** QR code or redirect to Warpcast
3. **Complete** authentication flow
4. **Sync** with backend and store token

## 🧩 Key Features

### **AuthKit Provider**
\`\`\`tsx
// Wraps entire app for Farcaster context
<AuthKitContextProvider>
  {children}
</AuthKitContextProvider>
\`\`\`

### **Automatic Profile Sync**
\`\`\`tsx
const { isAuthenticated, profile, authToken } = useFarcaster()

// Backend automatically verifies with Neynar API
// Falls back gracefully if API unavailable
\`\`\`

### **Mini App Detection**
\`\`\`tsx
const isInFarcasterApp = typeof window !== 'undefined' && 
  (window.parent !== window || navigator.userAgent.includes('Farcaster'))
\`\`\`

### **Seamless Backend Integration**
\`\`\`tsx
// AuthKit data sent to backend for verification
await fetch('/api/auth/fc/callback', {
  body: JSON.stringify({
    fid: profile.fid,
    username: profile.username,
    displayName: profile.displayName,
    // ... other AuthKit data
  })
})
\`\`\`

## 📋 Component API

### **`<FarcasterAuthKit />`**
\`\`\`tsx
interface FarcasterAuthKitProps {
  onAuthenticated?: (userData: any) => void
}
\`\`\`

### **`useFarcaster()` Hook**
\`\`\`tsx
const {
  // Auth state
  isAuthenticated: boolean,
  profile: FarcasterProfile | null,
  authToken: string | null,
  isLoading: boolean,
  error: string | null,

  // Auth methods  
  signIn: () => void,
  signOut: () => void,
  connect: () => void,
  reconnect: () => void,

  // Helper methods
  makeAuthenticatedRequest: (url, options) => Promise<Response>,

  // Raw AuthKit data
  signInData: any,
  validSignature: boolean,
  url: string,
  channelToken: string,
} = useFarcaster()
\`\`\`

## 🔗 Integration Benefits

### **For Farcaster Mini Apps:**
- ✅ **Zero-friction** user onboarding
- ✅ **Automatic** authentication
- ✅ **Native** Farcaster experience
- ✅ **Real-time** profile data

### **For Web Applications:**
- ✅ **Standard** SIWF flow
- ✅ **QR code** convenience
- ✅ **Cross-platform** compatibility
- ✅ **Verified** user identity

### **For Developers:**
- ✅ **Official** Farcaster SDK
- ✅ **Type-safe** React hooks
- ✅ **Automatic** error handling
- ✅ **Seamless** backend sync

## 🏗 Architecture

\`\`\`
Farcaster Mini App / Web Browser
        ↓
  AuthKit Provider
        ↓
  Sign In Component
        ↓
  useFarcaster() Hook
        ↓
  Frontend API Route (/api/auth/fc/callback)
        ↓
  Backend Auth Service
        ↓
  Neynar API Verification (optional)
        ↓
  Database User Storage
        ↓
  JWT Token Return
\`\`\`

## 🎯 Usage Examples

### **Complete Integration:**
\`\`\`tsx
import { SnelOSConnectAuthKit } from '@/components/snel-os-connect-authkit'

function App() {
  return <SnelOSConnectAuthKit />
}
\`\`\`

### **Farcaster-Only Auth:**
\`\`\`tsx
import { FarcasterAuthKit } from '@/components/auth/farcaster-authkit'

function LoginPage() {
  return (
    <FarcasterAuthKit 
      onAuthenticated={(user) => {
        console.log('User authenticated:', user)
        // Handle successful auth
      }}
    />
  )
}
\`\`\`

### **Authenticated Requests:**
\`\`\`tsx
function MyComponent() {
  const { makeAuthenticatedRequest } = useFarcaster()
  
  const createPost = async () => {
    const response = await makeAuthenticatedRequest('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello Farcaster!' })
    })
  }
}
\`\`\`

## 🚀 Deployment

### **Farcaster Mini App:**
1. **Deploy** to production
2. **Submit** to Farcaster for review
3. **Enable** in Warpcast directory
4. **Users** get automatic authentication

### **Web Application:**
1. **Deploy** with AuthKit configured
2. **Users** sign in via QR code
3. **Redirect** flow handles authentication
4. **Seamless** cross-platform experience

## 📚 References

- **Farcaster AuthKit**: [https://docs.farcaster.xyz/auth-kit/](https://docs.farcaster.xyz/auth-kit/)
- **Warpcast API**: [https://docs.farcaster.xyz/reference/warpcast/api](https://docs.farcaster.xyz/reference/warpcast/api)
- **Neynar API**: [https://docs.neynar.com/reference/quickstart](https://docs.neynar.com/reference/quickstart)

---

**🎉 Ready for seamless Farcaster authentication!**
