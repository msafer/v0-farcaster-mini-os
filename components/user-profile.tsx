"use client"

import { useState, useEffect } from "react"
// Temporarily disabled: import { SnelOSConnectAuthKit } from "@/components/snel-os-connect-authkit"

interface UserStats {
  currentStreak: number
  longestStreak: number
  totalDays: number
  followers: number
  following: number
  isLensVerified: boolean
  profileImage: string
  username: string
  lensHandle: string
}

export function UserProfile() {
  const [userStats, setUserStats] = useState<UserStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    followers: 0,
    following: 0,
    isLensVerified: false,
    profileImage: "/diverse-user-avatars.png",
    username: "SnelUser",
    lensHandle: "",
  })

  useEffect(() => {
    // Load user stats from localStorage
    const savedStats = localStorage.getItem("snel-user-stats")
    if (savedStats) {
      setUserStats(JSON.parse(savedStats))
    } else {
      const mockStats = {
        currentStreak: 12,
        longestStreak: 26,
        totalDays: 45,
        followers: 1247892, // 7 digits
        following: 892456, // 6 digits
        isLensVerified: true,
        profileImage: "/diverse-user-avatars.png",
        username: "SnelUser",
        lensHandle: "sneluser.lens",
      }
      setUserStats(mockStats)
      localStorage.setItem("snel-user-stats", JSON.stringify(mockStats))
    }
  }, [])

  const getMilestoneStatus = (days: number) => {
    return userStats.longestStreak >= days
  }

  const getMilestoneIcon = (days: number) => {
    const achieved = getMilestoneStatus(days)
    const icons = {
      7: "🔥",
      14: "🔥", // Both 7 and 14 day milestones show flame
      30: "🌟",
      90: "💎",
      365: "👑",
    }
    return achieved ? icons[days as keyof typeof icons] : "⚪"
  }

  const formatNumber = (num: number) => {
    if (num === null || num === undefined || isNaN(num)) {
      return "0"
    }
    return num.toLocaleString()
  }

  return (
    <div className="space-y-4">
      {/* Authentication & Wallet Connection - Temporarily Disabled */}
      <div className="pixel-border bg-secondary p-4">
        <h3 className="retro-font text-lg mb-3">Connect & Authenticate</h3>
        <p className="text-sm text-muted-foreground">
          Wallet connection temporarily disabled while fixing UI components.
        </p>
      </div>

      <div className="pixel-border bg-secondary p-4">
        <h3 className="retro-font text-lg mb-3">User Profile</h3>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 pixel-border bg-white flex items-center justify-center text-2xl">👤</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{userStats.username}</span>
              {userStats.isLensVerified && <span className="text-green-500 text-sm">✓ Lens</span>}
            </div>
            {userStats.lensHandle && <div className="text-xs text-muted-foreground">@{userStats.lensHandle}</div>}
            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
              <span>{formatNumber(userStats.followers)} followers</span>
              <span>{formatNumber(userStats.following)} following</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{userStats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{userStats.longestStreak}</div>
            <div className="text-xs text-muted-foreground">Longest Streak</div>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-lg font-bold">{userStats.totalDays}</div>
          <div className="text-xs text-muted-foreground">Total Active Days</div>
        </div>

        <div className="space-y-2">
          <h4 className="retro-font text-sm">Streak Milestones</h4>
          <div className="grid grid-cols-5 gap-2">
            <div className="text-center">
              <div className="text-lg">{getMilestoneIcon(7)}</div>
              <div className="text-xs">7d</div>
            </div>
            <div className="text-center">
              <div className="text-lg">{getMilestoneIcon(14)}</div>
              <div className="text-xs">14d</div>
            </div>
            <div className="text-center">
              <div className="text-lg">{getMilestoneIcon(30)}</div>
              <div className="text-xs">30d</div>
            </div>
            <div className="text-center">
              <div className="text-lg">{getMilestoneIcon(90)}</div>
              <div className="text-xs">90d</div>
            </div>
            <div className="text-center">
              <div className="text-lg">{getMilestoneIcon(365)}</div>
              <div className="text-xs">365d</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
