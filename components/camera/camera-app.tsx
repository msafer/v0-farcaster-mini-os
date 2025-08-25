"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/pixel95/button"
import { Icon } from "@/components/pixel95/icon"
import { cn } from "@/lib/utils"
import { useCamera } from "@/hooks/use-camera"
import { PhotoPreview } from "./photo-preview"
import { CountdownTimer } from "./countdown-timer"

interface CameraAppProps {
  className?: string
  autoTag?: string // For mail prompts
}

export function CameraApp({ className, autoTag }: CameraAppProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const { canPostToday, timeUntilReset, todaysPost, submitPhoto, isSubmitting } = useCamera()

  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 1440px)
        let { width, height } = img
        const maxSize = 1440

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width
            width = maxSize
          } else {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)

        // Compress to max 2MB
        let quality = 0.9
        let dataUrl = canvas.toDataURL("image/jpeg", quality)

        while (dataUrl.length > 2 * 1024 * 1024 && quality > 0.1) {
          quality -= 0.1
          dataUrl = canvas.toDataURL("image/jpeg", quality)
        }

        resolve(dataUrl)
      }

      img.src = URL.createObjectURL(file)
    })
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const compressedImage = await compressImage(file)
      setCapturedPhoto(compressedImage)
    } catch (error) {
      console.error("Error processing image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")!

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    setCapturedPhoto(dataUrl)
    stopCamera()
  }

  const handleSubmit = async () => {
    if (!capturedPhoto) return

    const success = await submitPhoto(capturedPhoto, autoTag)
    if (success) {
      setCapturedPhoto(null)
    }
  }

  const resetCapture = () => {
    setCapturedPhoto(null)
    stopCamera()
  }

  // If user already posted today, show their post
  if (!canPostToday && todaysPost) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center space-y-2">
          <h3 className="retro-font text-lg">Today's Post</h3>
          <p className="text-sm text-muted-foreground">You've already posted today!</p>
        </div>

        <PhotoPreview photo={todaysPost} showShareButton={true} onShare={() => console.log("Share to Farcaster")} />

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Next post available in:</p>
          <CountdownTimer timeLeft={timeUntilReset} />
        </div>
      </div>
    )
  }

  // If user can't post today but hasn't posted yet
  if (!canPostToday) {
    return (
      <div className={cn("text-center space-y-4", className)}>
        <div className="space-y-2">
          <Icon name="camera" size="lg" className="mx-auto opacity-50" />
          <h3 className="retro-font text-lg">Camera Locked</h3>
          <p className="text-sm text-muted-foreground">Next post available in:</p>
        </div>
        <CountdownTimer timeLeft={timeUntilReset} />
      </div>
    )
  }

  // Show photo preview if captured
  if (capturedPhoto) {
    return (
      <div className={cn("space-y-4", className)}>
        <PhotoPreview photo={{ imageUrl: capturedPhoto, caption: autoTag || "", likes: 0 }} showShareButton={false} />

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isSubmitting} variant="accent" className="flex-1">
            {isSubmitting ? "Posting..." : "Post Photo"}
          </Button>
          <Button onClick={resetCapture} variant="default">
            Retake
          </Button>
        </div>

        {autoTag && <p className="text-xs text-muted-foreground text-center">Tagged: {autoTag}</p>}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center space-y-2">
        <h3 className="retro-font text-lg">Daily Photo</h3>
        <p className="text-sm text-muted-foreground">
          {autoTag ? `Quest: ${autoTag}` : "Capture your moment of the day"}
        </p>
      </div>

      {/* Camera View */}
      {isCameraActive && (
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline className="w-full pixel-border rounded" />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button onClick={capturePhoto} variant="accent">
              <Icon name="camera" size="sm" />
              Capture
            </Button>
            <Button onClick={stopCamera}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Camera Controls */}
      {!isCameraActive && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={startCamera} className="flex-col gap-2 h-20">
              <Icon name="camera" size="md" />
              <span className="text-xs">Take Photo</span>
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-col gap-2 h-20"
            >
              <Icon name="folder" size="md" />
              <span className="text-xs">{isUploading ? "Processing..." : "Upload"}</span>
            </Button>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
