"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/pixel95/button"

export function SettingsApp() {
  const [accentColor, setAccentColor] = useState("#fbbf24")
  const [notifications, setNotifications] = useState(true)
  const [privacy, setPrivacy] = useState("public")
  const [isConnected, setIsConnected] = useState(false)

  const colors = [
    "#fbbf24", // yellow
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#8b5cf6", // purple
    "#f97316", // orange
  ]

  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent", accentColor)
    document.documentElement.style.setProperty("--accent", accentColor)
    // Apply to chat names and app highlights
    document.documentElement.style.setProperty("--chat-accent", accentColor)
    document.documentElement.style.setProperty("--app-highlight", accentColor)
    localStorage.setItem("snel-accent-color", accentColor)
  }, [accentColor])

  useEffect(() => {
    const savedColor = localStorage.getItem("snel-accent-color")
    if (savedColor) {
      setAccentColor(savedColor)
    }
  }, [])

  const handleConnectWallet = () => {
    console.log("[v0] Simulating wallet connection...")
    const walletTypes = ["MetaMask", "WalletConnect", "Coinbase Wallet"]
    const randomWallet = walletTypes[Math.floor(Math.random() * walletTypes.length)]

    setIsConnected(true)
    setTimeout(() => {
      alert(`${randomWallet} connected! (Simulated)\n\nAddress: 0x742d...3f8a`)
    }, 1000)
  }

  const handleLinkLens = () => {
    console.log("[v0] Simulating Lens profile linking...")
    const confirmed = confirm(
      "🌿 Connect to Lens Protocol?\n\n" +
        "This will:\n" +
        "• Open your Web3 wallet\n" +
        "• Request signature for profile verification\n" +
        "• Link your Lens handle to Snel OS\n\n" +
        "Continue?",
    )
    if (confirmed) {
      setTimeout(() => {
        alert("🌿 Lens Profile Linked!\n\nHandle: @sneluser.lens\nProfile verified ✓")
      }, 1500)
    }
  }

  return (
    <div className="h-full bg-gray-200 p-4">
      <div className="pixel-border bg-white h-full p-4">
        <h2 className="text-lg font-bold mb-4 text-black">Settings</h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-black">Accent Color</h3>
            <p className="text-xs text-gray-600 mb-2">Changes chat names and app highlights</p>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`w-8 h-8 pixel-border transition-all ${accentColor === color ? "ring-2 ring-black scale-110" : ""}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color} as accent color`}
                />
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Current: <span style={{ color: accentColor }}>●</span> {accentColor}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-black">Notifications</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="pixel-border"
              />
              <span className="text-black">Enable notifications</span>
            </label>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-black">Privacy</h3>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="pixel-border p-2 text-black"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-black">Wallet & Profile</h3>
            <div className="space-y-2">
              <Button onClick={handleConnectWallet} className="w-full touch-target">
                {isConnected ? "✓ Wallet Connected" : "🏦 Connect Wallet"}
              </Button>
              <Button onClick={handleLinkLens} className="w-full touch-target">
                🌿 Link Lens Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
