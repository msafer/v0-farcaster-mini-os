import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEYNAR_API_KEY_EXISTS: !!process.env.NEYNAR_API_KEY,
    NEXT_PUBLIC_NEYNAR_API_KEY_EXISTS: !!process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
    BUILD_TIME: new Date().toISOString(),
  }

  return NextResponse.json({
    status: 'OK',
    environment: envVars,
    timestamp: new Date().toISOString(),
    message: 'Debug endpoint working'
  })
}
