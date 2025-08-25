import type React from "react"
import { cn } from "@/lib/utils"

interface StatusBarProps {
  className?: string
  children?: React.ReactNode
}

export function StatusBar({ className, children }: StatusBarProps) {
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 pixel-border-inset bg-secondary text-secondary-foreground px-2 py-1 z-50",
        className,
      )}
    >
      <div className="flex items-center justify-between retro-font text-xs">
        <div className="flex items-center gap-2">
          <span>Snel OS</span>
          {children}
        </div>
        <div className="flex items-center gap-2">
          <span>{currentTime}</span>
        </div>
      </div>
    </div>
  )
}
