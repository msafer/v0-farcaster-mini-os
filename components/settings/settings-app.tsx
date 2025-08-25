"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/pixel95/button"
// Wallet connections moved back to Wallet app

export function SettingsApp() {
  const [accentColor, setAccentColor] = useState("#fbbf24")
  const [notifications, setNotifications] = useState(true)
  const [privacy, setPrivacy] = useState("public")
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
            <h3 className="font-semibold mb-2 text-black">Farcaster Authentication</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Farcaster authentication is handled automatically in the Farcaster mini app.
              </p>
              <p className="text-sm text-gray-600">
                For wallet connections, use the Wallet app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
