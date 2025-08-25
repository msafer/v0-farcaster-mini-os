"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface WindowProps {
  title: string
  children: React.ReactNode
  className?: string
  defaultPosition?: { x: number; y: number }
  defaultSize?: { width: number; height: number }
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  isMaximized?: boolean
  isMinimized?: boolean
}

export function Window({
  title,
  children,
  className,
  defaultPosition = { x: 50, y: 50 },
  defaultSize = { width: 400, height: 300 },
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
  isMinimized = false,
}: WindowProps) {
  const [position, setPosition] = useState(defaultPosition)
  const [size, setSize] = useState(defaultSize)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return

    const rect = windowRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset, isMaximized])

  if (isMinimized) return null

  return (
    <div
      ref={windowRef}
      className={cn("absolute pixel-border bg-card z-10 select-none", isMaximized ? "inset-0" : "", className)}
      style={
        isMaximized
          ? {}
          : {
              left: position.x,
              top: position.y,
              width: size.width,
              height: size.height,
            }
      }
    >
      {/* Title Bar */}
      <div
        className="pixel-border bg-primary text-primary-foreground px-2 py-1 cursor-move flex items-center justify-between retro-font text-sm"
        onMouseDown={handleMouseDown}
      >
        <span>{title}</span>
        <div className="flex gap-1">
          {onMinimize && (
            <button className="w-4 h-4 pixel-button text-xs flex items-center justify-center" onClick={onMinimize}>
              _
            </button>
          )}
          {onMaximize && (
            <button className="w-4 h-4 pixel-button text-xs flex items-center justify-center" onClick={onMaximize}>
              □
            </button>
          )}
          {onClose && (
            <button className="w-4 h-4 pixel-button text-xs flex items-center justify-center" onClick={onClose}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-2 h-full overflow-auto">{children}</div>
    </div>
  )
}
