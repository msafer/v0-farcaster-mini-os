"use client"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Icon } from "./icon"

interface DockItem {
  id: string
  name: string
  icon: string
  onClick: () => void
}

interface DockProps {
  items: DockItem[]
  className?: string
}

export function Dock({ items, className }: DockProps) {
  return (
    <div className={cn("fixed bottom-0 left-0 right-0 pixel-border bg-secondary p-2 z-50", className)}>
      <div className="flex justify-center gap-2 max-w-screen-sm mx-auto">
        {items.map((item) => (
          <Button
            key={item.id}
            size="lg"
            onClick={item.onClick}
            className="flex-col gap-1 min-w-16 h-16"
            title={item.name}
          >
            <Icon name={item.icon} size="md" />
            <span className="text-xs truncate w-full">{item.name}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
