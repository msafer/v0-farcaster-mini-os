"use client"

import type React from "react"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={cn("pixel-border bg-card max-w-md w-full max-h-[80vh] overflow-hidden", className)}>
        {/* Title Bar */}
        <div className="pixel-border bg-primary text-primary-foreground px-2 py-1 flex items-center justify-between retro-font text-sm">
          <span>{title}</span>
          <Button size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[60vh]">{children}</div>
      </div>
    </div>
  )
}
