"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/pixel95/button"

interface User {
  id: string
  name: string
  handle: string
  avatar: string
  isFollowing: boolean // Added follow state tracking
}

export function SearchApp() {
  const [users, setUsers] = useState<User[]>([])
  const [cooldown, setCooldown] = useState(0)
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set()) // Track followed users

  const mockUsers = [
    { id: "1", name: "Alice", handle: "@alice", avatar: "👩", isFollowing: false },
    { id: "2", name: "Bob", handle: "@bob", avatar: "👨", isFollowing: false },
    { id: "3", name: "Charlie", handle: "@charlie", avatar: "🧑", isFollowing: false },
    { id: "4", name: "Diana", handle: "@diana", avatar: "👩‍🦰", isFollowing: false },
    { id: "5", name: "Eve", handle: "@eve", avatar: "👩‍🦱", isFollowing: false },
    { id: "6", name: "Frank", handle: "@frank", avatar: "👨‍🦲", isFollowing: false },
    { id: "7", name: "Grace", handle: "@grace", avatar: "👩‍🦳", isFollowing: false },
    { id: "8", name: "Henry", handle: "@henry", avatar: "👨‍🦱", isFollowing: false },
    { id: "9", name: "Ivy", handle: "@ivy", avatar: "👩‍🦲", isFollowing: false },
    { id: "10", name: "Jack", handle: "@jack", avatar: "👨‍🦳", isFollowing: false },
  ]

  const handleFollow = (userId: string) => {
    console.log("[v0] Following user:", userId)
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user)),
    )

    setFollowedUsers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const getRandomUsers = () => {
    const shuffled = [...mockUsers].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 10).map((user) => ({
      ...user,
      isFollowing: followedUsers.has(user.id), // Preserve follow state
    }))
  }

  const reroll = () => {
    if (cooldown === 0) {
      setUsers(getRandomUsers())
      setCooldown(30)
    }
  }

  useEffect(() => {
    setUsers(getRandomUsers())
  }, [])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  return (
    <div className="h-full bg-gray-200 p-4">
      <div className="pixel-border bg-white h-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-black">Discover Users</h2>
          <Button onClick={reroll} disabled={cooldown > 0}>
            {cooldown > 0 ? `Reroll (${cooldown}s)` : "Reroll"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {users.map((user) => (
            <div key={user.id} className="pixel-border bg-gray-100 p-3 text-center">
              <div className="text-2xl mb-2">{user.avatar}</div>
              <div className="font-semibold text-black">{user.name}</div>
              <div className="text-sm text-gray-600">{user.handle}</div>
              <Button
                className={`mt-2 text-xs ${user.isFollowing ? "bg-green-500" : ""}`}
                onClick={() => handleFollow(user.id)}
              >
                {user.isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
