import type React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "accent" | "destructive"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export function Button({ variant = "default", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "pixel-button retro-font inline-flex items-center justify-center gap-2",
        {
          "px-2 py-1 text-xs": size === "sm",
          "px-3 py-2 text-sm": size === "md",
          "px-4 py-3 text-base": size === "lg",
        },
        {
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground": variant === "default",
          "bg-accent text-accent-foreground hover:bg-accent/80": variant === "accent",
          "bg-destructive text-destructive-foreground hover:bg-destructive/80": variant === "destructive",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
