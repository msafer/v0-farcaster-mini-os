"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"

interface DesktopIconProps {
  id: string
  name: string
  icon: string
  onClick: () => void
  position: { x: number; y: number }
  className?: string
}

export function DesktopIcon({ id, name, icon, onClick, position, className }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false)

  const handleClick = () => {
    setIsSelected(true)
    onClick()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClick()
    }
  }

  const handleBlur = () => {
    setIsSelected(false)
  }

  return (
    <div
      className={cn(
        "absolute flex flex-col items-center gap-1 p-2 cursor-pointer select-none",
        "hover:bg-accent/20 rounded focus:focus-visible-ring touch-target",
        isSelected && "bg-accent/30",
        className,
      )}
      style={{ left: position.x, top: position.y }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      tabIndex={0}
      role="button"
      aria-label={`Open ${name} application`}
    >
      <div className="w-8 h-8 flex items-center justify-center">
        <Icon name={icon} size="lg" />
      </div>
      <span className="text-xs retro-font text-foreground text-center max-w-16 truncate">{name}</span>
    </div>
  )
}
