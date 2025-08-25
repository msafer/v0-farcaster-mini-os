"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { StatusBar } from "@/components/pixel95/status-bar"
import { DesktopIcon } from "@/components/pixel95/desktop-icon"
import { ContextMenu } from "@/components/pixel95/context-menu"
import { Button } from "@/components/pixel95/button"
import { CameraApp } from "@/components/camera/camera-app"
import { MailApp } from "@/components/mail/mail-app"
import { NotesApp } from "@/components/notes/notes-app"
import { ChatApp } from "@/components/chat/chat-app"
import { SearchApp } from "@/components/search/search-app"
import { SettingsApp } from "@/components/settings/settings-app"
import { TreasuryApp } from "@/components/treasury/treasury-app"
import { UserProfile } from "@/components/user-profile"
import { FilesApp } from "@/components/files/files-app"
import { SnelOSConnectAuthKit } from "@/components/snel-os-connect-authkit"

const apps = [
  { id: "camera", name: "Camera", icon: "camera" },
  { id: "mail", name: "Mail", icon: "mail" },
  { id: "notes", name: "Notes", icon: "notes" },
  { id: "chat", name: "Chat", icon: "chat" },
  { id: "search", name: "Search", icon: "search" },
  { id: "settings", name: "Settings", icon: "settings" },
  { id: "treasury", name: "Treasury", icon: "treasury" },
  { id: "wallet", name: "Wallet", icon: "wallet" },
]

const desktopIcons = [
  { id: "profile", name: "Profile", icon: "user", position: { x: 20, y: 60 } },
  { id: "camera", name: "Camera", icon: "camera", position: { x: 120, y: 60 } },
  { id: "mail", name: "Mail", icon: "mail", position: { x: 220, y: 60 } },
  { id: "notes", name: "Notes", icon: "notes", position: { x: 20, y: 160 } },
  { id: "chat", name: "Chat", icon: "chat", position: { x: 120, y: 160 } },
  { id: "search", name: "Search", icon: "search", position: { x: 220, y: 160 } },
  { id: "settings", name: "Settings", icon: "settings", position: { x: 20, y: 260 } },
  { id: "wallet", name: "Wallet", icon: "wallet", position: { x: 120, y: 260 } },
  { id: "folder", name: "My Files", icon: "folder", position: { x: 220, y: 260 } },
]

export default function SnelOS() {
  const [currentApp, setCurrentApp] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
  }>({ isOpen: false, position: { x: 0, y: 0 } })
  const [userRole] = useState<"admin" | "user">("user") // Mock user role
  const [walletType, setWalletType] = useState<"external" | "farcaster">("external")

  useEffect(() => {
    const handleOpenApp = (event: CustomEvent) => {
      const appId = event.detail
      setCurrentApp(appId)
    }

    window.addEventListener("openApp", handleOpenApp as EventListener)

    return () => {
      window.removeEventListener("openApp", handleOpenApp as EventListener)
    }
  }, [])

  const handleAppClick = (appId: string) => {
    setCurrentApp(appId)
  }

  const handleBackToDesktop = () => {
    setCurrentApp(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent, appId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleAppClick(appId)
    }
  }

  const handleDesktopRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
    })
  }

  const contextMenuItems = [
    {
      id: "refresh",
      label: "Refresh",
      onClick: () => window.location.reload(),
    },
    {
      id: "properties",
      label: "Properties",
      onClick: () => {},
      disabled: true,
    },
  ]

  const dockItemsWithHandlers = apps.map((item) => ({
    ...item,
    onClick: () => handleAppClick(item.id),
  }))

  if (currentApp) {
    return (
      <div className="min-h-screen bg-background flex flex-col mobile-safe-area">
        <StatusBar>
          <div className="flex items-center justify-between w-full px-4">
            <Button
              onClick={handleBackToDesktop}
              className="text-xs px-2 py-1 touch-target"
              aria-label="Return to desktop"
            >
              ← Desktop
            </Button>
            <span className="retro-font text-sm mobile-text-lg" role="heading" aria-level={1}>
              {apps.find((app) => app.id === currentApp)?.name || currentApp}
            </span>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </StatusBar>

        <main
          className="flex-1 p-2 sm:p-4 overflow-auto"
          role="main"
          aria-label={`${apps.find((app) => app.id === currentApp)?.name} application`}
        >
          {currentApp === "profile" && <UserProfile />}
          {currentApp === "camera" && <CameraApp />}
          {currentApp === "mail" && <MailApp />}
          {currentApp === "notes" && <NotesApp />}
          {currentApp === "chat" && <ChatApp />}
          {currentApp === "search" && <SearchApp />}
          {currentApp === "settings" && <SettingsApp />}
          {currentApp === "treasury" && userRole === "admin" && <TreasuryApp />}
          {currentApp === "wallet" && userRole === "user" && (
            <div className="space-y-4 pt-6">
              {" "}
              {/* Added pt-6 to push wallet content down from header */}
              <div className="pixel-border bg-secondary p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="retro-font text-xl">Wallet</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setWalletType("external")}
                      className={`text-xs ${walletType === "external" ? "bg-accent text-accent-foreground" : ""}`}
                    >
                      External
                    </Button>
                    <Button
                      onClick={() => setWalletType("farcaster")}
                      className={`text-xs ${walletType === "farcaster" ? "bg-accent text-accent-foreground" : ""}`}
                    >
                      Farcaster
                    </Button>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  {walletType === "external" ? (
                    <SnelOSConnectAuthKit />
                  ) : (
                    <div className="p-4 pixel-border bg-background">
                      <h3 className="retro-font mb-2">Farcaster Integration</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use the Profile app to connect your Farcaster account via AuthKit.
                      </p>
                      <Button
                        onClick={() => handleAppClick("profile")}
                        className="w-full"
                      >
                        Go to Profile
                      </Button>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    {walletType === "external"
                      ? "Connect your external Web3 wallet to view balance and transactions."
                      : "Connect your Farcaster wallet to view balance and transactions."}
                  </p>

                  <div className="mt-6 p-4 pixel-border bg-background">
                    <h3 className="retro-font mb-2">Wallet Features</h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• View token balances</li>
                      <li>• Transaction history</li>
                      <li>• Send & receive payments</li>
                      <li>• NFT collection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          {(currentApp === "home" || currentApp === "folder") && (
            <div>
              {currentApp === "folder" && <FilesApp />}
              {currentApp === "home" && (
                <div className="text-center space-y-4 mt-8 mobile-spacing">
                  <h2 className="retro-font text-xl mobile-text-lg">Home</h2>
                  <p className="text-sm text-muted-foreground">Home screen feature coming soon!</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden mobile-safe-area">
      <StatusBar>
        <div className="flex items-center justify-center w-full">
          <span className="retro-font text-sm mobile-text-lg" role="heading" aria-level={1}>
            Snel OS Desktop
          </span>
        </div>
      </StatusBar>

      <main
        className="pt-8 min-h-screen bg-gradient-to-br from-muted to-background"
        onContextMenu={handleDesktopRightClick}
        onClick={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 } })}
        role="main"
        aria-label="Desktop with application icons"
      >
        <div
          className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width%3D%2220%22 height%3D%2220%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern id%3D%22grid%22 width%3D%2220%22 height%3D%2220%22 patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath d%3D%22M 20 0 L 0 0 0 20%22 fill%3D%22none%22 stroke%3D%22gray%22 strokeWidth%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect width%3D%22100%25%22 height%3D%22100%25%22 fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')]"
          aria-hidden="true"
        ></div>

        <div className="hidden sm:block">
          {desktopIcons.map((icon) => (
            <DesktopIcon
              key={icon.id}
              id={icon.id}
              name={icon.name}
              icon={icon.icon}
              position={icon.position}
              onClick={() => handleAppClick(icon.id)}
            />
          ))}
        </div>

        <div className="sm:hidden desktop-grid grid grid-cols-3 gap-4 p-4 pt-8">
          {desktopIcons.map((icon) => (
            <button
              key={icon.id}
              onClick={() => handleAppClick(icon.id)}
              onKeyDown={(e) => handleKeyDown(e, icon.id)}
              className="flex flex-col items-center gap-2 p-3 touch-target focus:focus-visible-ring rounded pixel-border"
              aria-label={`Open ${icon.name} application`}
            >
              <div className="w-12 h-12 bg-secondary pixel-border flex items-center justify-center text-xl">
                {icon.icon === "profile" && "👤"}
                {icon.icon === "camera" && "📷"}
                {icon.icon === "mail" && "📧"}
                {icon.icon === "notes" && "📝"}
                {icon.icon === "chat" && "💬"}
                {icon.icon === "search" && "🔍"}
                {icon.icon === "settings" && "⚙️"}
                {icon.icon === "wallet" && "🏦"}
                {icon.icon === "folder" && "📁"}
              </div>
              <span className="text-xs text-center retro-font">{icon.name}</span>
            </button>
          ))}
        </div>

        <div className="absolute bottom-24 left-2 right-2 sm:left-4 sm:right-4 bg-background/90 border-2 border-foreground p-3 sm:p-4 rounded pixel-border">
          <h2 className="retro-font text-base sm:text-lg text-foreground mb-2">Welcome to Snel OS!</h2>
          <p className="text-xs text-muted-foreground mb-2">
            A retro mini operating system for Farcaster. Tap icons to open apps.
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Camera: Post one photo per day</p>
            <p>• Mail: Complete daily quests</p>
            <p>• Notes: Write in your diary</p>
            <p>• Chat: Join AOL-style rooms</p>
          </div>
        </div>
      </main>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={contextMenuItems}
        onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 } })}
      />
    </div>
  )
}
