"use client"

import { useState, useEffect } from "react"

interface Photo {
  id: string
  imageUrl: string
  caption: string
  likes: number
  timestamp: Date
}

export function useCamera() {
  const [todaysPost, setTodaysPost] = useState<Photo | null>(null)
  const [canPostToday, setCanPostToday] = useState(true)
  const [timeUntilReset, setTimeUntilReset] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if user has posted today
    const lastPostDate = localStorage.getItem("snel-os-last-post-date")
    const today = new Date().toDateString()

    if (lastPostDate === today) {
      setCanPostToday(false)
      // Load today's post
      const savedPost = localStorage.getItem("snel-os-todays-post")
      if (savedPost) {
        const post = JSON.parse(savedPost)
        setTodaysPost({
          ...post,
          timestamp: new Date(post.timestamp),
        })
      }
    } else {
      setCanPostToday(true)
      setTodaysPost(null)
    }

    // Calculate time until midnight (reset time)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    setTimeUntilReset(tomorrow.getTime() - now.getTime())

    // Update countdown every second
    const interval = setInterval(() => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const timeLeft = tomorrow.getTime() - now.getTime()

      setTimeUntilReset(timeLeft)

      // Reset at midnight
      if (timeLeft <= 0) {
        setCanPostToday(true)
        setTodaysPost(null)
        localStorage.removeItem("snel-os-last-post-date")
        localStorage.removeItem("snel-os-todays-post")
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const submitPhoto = async (imageUrl: string, caption?: string): Promise<boolean> => {
    if (!canPostToday) return false

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newPost: Photo = {
        id: Date.now().toString(),
        imageUrl,
        caption: caption || "",
        likes: 0,
        timestamp: new Date(),
      }

      // Save to localStorage (mock database)
      localStorage.setItem("snel-os-last-post-date", new Date().toDateString())
      localStorage.setItem("snel-os-todays-post", JSON.stringify(newPost))

      setTodaysPost(newPost)
      setCanPostToday(false)

      return true
    } catch (error) {
      console.error("Error submitting photo:", error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    todaysPost,
    canPostToday,
    timeUntilReset,
    isSubmitting,
    submitPhoto,
  }
}
