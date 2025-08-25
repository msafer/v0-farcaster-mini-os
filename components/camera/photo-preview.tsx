"use client"

import { useState } from "react"
import { Button } from "@/components/pixel95/button"
import { Icon } from "@/components/pixel95/icon"
import { cn } from "@/lib/utils"

interface Photo {
  imageUrl: string
  caption: string
  likes: number
  id?: string
  timestamp?: Date
}

interface PhotoPreviewProps {
  photo: Photo
  showShareButton?: boolean
  onShare?: () => void
  onLike?: () => void
  className?: string
}

export function PhotoPreview({ photo, showShareButton = false, onShare, onLike, className }: PhotoPreviewProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(photo.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
    onLike?.()
  }

  const handleShare = () => {
    // Generate shareable link
    const shareUrl = `${window.location.origin}/share/photo/${photo.id || "demo"}`

    if (navigator.share) {
      navigator.share({
        title: "Check out my Snel OS photo!",
        text: photo.caption || "Shared from Snel OS",
        url: shareUrl,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      alert("Share link copied to clipboard!")
    }

    onShare?.()
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Photo */}
      <div className="pixel-border bg-card p-2">
        <img
          src={photo.imageUrl || "/placeholder.svg"}
          alt={photo.caption || "Photo"}
          className="w-full h-auto rounded"
        />
      </div>

      {/* Caption */}
      {photo.caption && <p className="text-sm text-foreground px-2">{photo.caption}</p>}

      {/* Actions */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isLiked ? "accent" : "default"}
            onClick={handleLike}
            className="flex items-center gap-1"
          >
            <span className={cn("text-sm", isLiked && "text-red-500")}>{isLiked ? "♥" : "♡"}</span>
            <span className="text-xs">{likeCount}</span>
          </Button>

          {photo.timestamp && (
            <span className="text-xs text-muted-foreground">{photo.timestamp.toLocaleDateString()}</span>
          )}
        </div>

        {showShareButton && (
          <Button size="sm" onClick={handleShare}>
            <Icon name="share" size="sm" />
            Share
          </Button>
        )}
      </div>
    </div>
  )
}
