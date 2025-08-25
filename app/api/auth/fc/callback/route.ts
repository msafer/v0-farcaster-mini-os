import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL } from '@/config/services'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // AuthKit provides fid, username, displayName, etc. directly
    if (!body.fid || !body.username) {
      return NextResponse.json(
        { error: 'Farcaster user data is required' },
        { status: 400 }
      )
    }

    // Forward the AuthKit data to the backend
    const response = await fetch(`${BACKEND_URL}/auth/fc/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Authentication failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Farcaster auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
