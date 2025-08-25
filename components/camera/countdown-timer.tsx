"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  timeLeft: number // milliseconds
  className?: string
}

export function CountdownTimer({ timeLeft, className }: CountdownTimerProps) {
  const [time, setTime] = useState(timeLeft)

  useEffect(() => {
    setTime(timeLeft)

    const interval = setInterval(() => {
      setTime((prev) => Math.max(0, prev - 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  return (
    <div className={cn("pixel-border-inset bg-muted p-3 text-center", className)}>
      <div className="retro-font text-lg text-accent">{formatTime(time)}</div>
      <div className="text-xs text-muted-foreground mt-1">until next post</div>
    </div>
  )
}
