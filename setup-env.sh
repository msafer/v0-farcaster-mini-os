#!/bin/bash

echo "Creating .env.local file for Snel OS..."

cat > .env.local << 'ENVEOF'
# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=4f196d627335b92874cb5b398121d116

# Neynar API Configuration
NEYNAR_API_KEY=E72DB815-4C11-4191-B39B-66223FB06814
NEXT_PUBLIC_NEYNAR_API_KEY=E72DB815-4C11-4191-B39B-66223FB06814

# Farcaster Configuration (you'll need to get these from https://warpcast.com/~/developers)
FARCASTER_CLIENT_ID=your_farcaster_client_id_here
FARCASTER_CLIENT_SECRET=your_farcaster_client_secret_here
FARCASTER_REDIRECT_URI=http://localhost:3000/api/auth/fc/callback

# Backend Configuration
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
ENVEOF

echo "✅ .env.local file created successfully!"
echo "⚠️  Note: You'll need to get real Farcaster client credentials from https://warpcast.com/~/developers"
