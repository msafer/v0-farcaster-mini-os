import { cn } from "@/lib/utils"

interface IconProps {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const iconMap = {
  camera: "📷",
  mail: "📧",
  notes: "📝",
  chat: "💬",
  search: "🔍",
  settings: "⚙️",
  treasury: "💰",
  folder: "📁",
  file: "📄",
  close: "×",
  minimize: "_",
  maximize: "□",
  home: "🏠",
  share: "🔗",
  user: "👤",
  wallet: "🏦",
}

export function Icon({ name, size = "md", className }: IconProps) {
  const iconChar = iconMap[name as keyof typeof iconMap] || "?"

  return (
    <span
      className={cn(
        "inline-block retro-font",
        {
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-lg": size === "lg",
        },
        className,
      )}
      style={{
        filter: "grayscale(100%) contrast(1.2)",
        fontFamily: "monospace",
      }}
    >
      {iconChar}
    </span>
  )
}
