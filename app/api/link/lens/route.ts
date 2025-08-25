import { type NextRequest, NextResponse } from "next/server"
import { BACKEND_URL } from "@/config/client-services"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, signature, message, lensProfile } = body

    if (!walletAddress || !signature || !message) {
      return NextResponse.json({ error: "Wallet address, signature, and message are required" }, { status: 400 })
    }

    // Get the auth token from headers
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/link/lens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        walletAddress,
        signature,
        message,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.error || "Failed to link Lens profile" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Lens linking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
