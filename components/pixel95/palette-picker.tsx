"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const accentColors = [
  { name: "Yellow", value: "oklch(0.8 0.15 85)", css: "#ffcc00" },
  { name: "Blue", value: "oklch(0.6 0.15 260)", css: "#4080ff" },
  { name: "Green", value: "oklch(0.7 0.12 160)", css: "#40cc80" },
  { name: "Pink", value: "oklch(0.7 0.18 15)", css: "#ff6b9d" },
  { name: "Orange", value: "oklch(0.7 0.15 40)", css: "#ff8040" },
]

interface PalettePickerProps {
  currentColor?: string
  onColorChange: (color: string) => void
  className?: string
}

export function PalettePicker({ currentColor = accentColors[0].value, onColorChange, className }: PalettePickerProps) {
  const [selectedColor, setSelectedColor] = useState(currentColor)

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    onColorChange(color)

    // Update CSS custom property
    document.documentElement.style.setProperty("--accent", color)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="retro-font text-sm text-foreground">Accent Color:</div>
      <div className="grid grid-cols-5 gap-2">
        {accentColors.map((color) => (
          <Button
            key={color.name}
            size="sm"
            className={cn(
              "w-8 h-8 p-0 border-2",
              selectedColor === color.value ? "border-foreground" : "border-border",
            )}
            style={{ backgroundColor: color.css }}
            onClick={() => handleColorSelect(color.value)}
            title={color.name}
          />
        ))}
      </div>
    </div>
  )
}
