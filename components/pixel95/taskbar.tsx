"use client"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Icon } from "./icon"

interface TaskbarItem {
  id: string
  title: string
  icon: string
  isActive: boolean
  isMinimized: boolean
  onClick: () => void
}

interface TaskbarProps {
  items: TaskbarItem[]
  className?: string
}

export function Taskbar({ items, className }: TaskbarProps) {
  return (
    <div className={cn("flex items-center gap-1 px-2", className)}>
      {items.map((item) => (
        <Button
          key={item.id}
          size="sm"
          variant={item.isActive ? "accent" : "default"}
          onClick={item.onClick}
          className={cn("flex items-center gap-2 max-w-32", item.isMinimized && "opacity-60")}
        >
          <Icon name={item.icon} size="sm" />
          <span className="truncate text-xs">{item.title}</span>
        </Button>
      ))}
    </div>
  )
}
