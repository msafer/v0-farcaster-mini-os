"use client"

import { useState, useCallback } from "react"

interface WindowState {
  id: string
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export function useWindowManager() {
  const [windows, setWindows] = useState<Record<string, WindowState>>({})
  const [highestZIndex, setHighestZIndex] = useState(10)

  const openWindow = useCallback(
    (id: string, defaultPosition = { x: 100, y: 100 }, defaultSize = { width: 400, height: 300 }) => {
      setWindows((prev) => {
        if (prev[id]) {
          // Window already exists, just bring to front and unminimize
          const newZIndex = highestZIndex + 1
          setHighestZIndex(newZIndex)
          return {
            ...prev,
            [id]: {
              ...prev[id],
              isMinimized: false,
              zIndex: newZIndex,
            },
          }
        }

        // Create new window
        const newZIndex = highestZIndex + 1
        setHighestZIndex(newZIndex)
        return {
          ...prev,
          [id]: {
            id,
            isMinimized: false,
            isMaximized: false,
            zIndex: newZIndex,
            position: defaultPosition,
            size: defaultSize,
          },
        }
      })
    },
    [highestZIndex],
  )

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const { [id]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id], isMinimized: true } : prev[id],
    }))
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id], isMaximized: !prev[id].isMaximized } : prev[id],
    }))
  }, [])

  const focusWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        if (!prev[id]) return prev

        const newZIndex = highestZIndex + 1
        setHighestZIndex(newZIndex)
        return {
          ...prev,
          [id]: {
            ...prev[id],
            zIndex: newZIndex,
          },
        }
      })
    },
    [highestZIndex],
  )

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows((prev) => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id], position } : prev[id],
    }))
  }, [])

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows((prev) => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id], size } : prev[id],
    }))
  }, [])

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
  }
}
