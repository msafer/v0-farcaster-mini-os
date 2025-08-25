"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/pixel95/button"

interface Quest {
  id: string
  title: string
  description: string
  completed: boolean
  type: "photo" | "note" | "chat" | "search"
  action: string
  validationKey: string
}

export function MailApp() {
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: "1",
      title: "Daily Photo",
      description: "Share a moment from your day",
      completed: false,
      type: "photo",
      action: "Open Camera and take a photo",
      validationKey: "dailyPhotoPosted",
    },
    {
      id: "2",
      title: "Write a Note",
      description: "Jot down your thoughts",
      completed: false,
      type: "note",
      action: "Open Notes and write an entry",
      validationKey: "noteWritten",
    },
    {
      id: "3",
      title: "Chat with Friends",
      description: "Join a conversation in the lobby",
      completed: false,
      type: "chat",
      action: "Join a chat room and send a message",
      validationKey: "chatMessageSent",
    },
  ])

  useEffect(() => {
    const checkQuestCompletion = () => {
      const today = new Date().toDateString()

      setQuests((prev) =>
        prev.map((quest) => {
          const completionKey = `${quest.validationKey}_${today}`
          const isCompleted = localStorage.getItem(completionKey) === "true"
          return { ...quest, completed: isCompleted }
        }),
      )
    }

    checkQuestCompletion()
    // Check every 5 seconds for quest completion
    const interval = setInterval(checkQuestCompletion, 5000)
    return () => clearInterval(interval)
  }, [])

  const doQuest = (quest: Quest) => {
    // Trigger the action based on quest type
    switch (quest.type) {
      case "photo":
        // Open camera app
        window.dispatchEvent(new CustomEvent("openApp", { detail: "camera" }))
        break
      case "note":
        // Open notes app
        window.dispatchEvent(new CustomEvent("openApp", { detail: "notes" }))
        break
      case "chat":
        // Open chat app
        window.dispatchEvent(new CustomEvent("openApp", { detail: "chat" }))
        break
      case "search":
        // Open search app
        window.dispatchEvent(new CustomEvent("openApp", { detail: "search" }))
        break
    }

    // Show action feedback
    const today = new Date().toDateString()
    const actionKey = `${quest.validationKey}_action_${today}`
    localStorage.setItem(actionKey, "true")
  }

  return (
    <div className="h-full bg-gray-200 p-4">
      <div className="pixel-border bg-white h-full p-4">
        <h2 className="text-lg font-bold mb-4 text-black">📧 Daily Quests</h2>
        <div className="space-y-3">
          {quests.map((quest) => (
            <div key={quest.id} className="pixel-border bg-gray-100 p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-black">{quest.title}</h3>
                    {quest.completed && <span className="text-green-600">🔥</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{quest.description}</p>
                  <p className="text-xs text-gray-500 italic">{quest.action}</p>
                </div>
                <Button
                  onClick={() => doQuest(quest)}
                  disabled={quest.completed}
                  className={quest.completed ? "bg-green-500 text-white" : ""}
                >
                  {quest.completed ? "✓ Done" : "Do"}
                </Button>
              </div>
              {quest.completed && (
                <div className="mt-2 text-xs text-green-600 font-semibold">✨ Quest completed! Streak maintained!</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pixel-border bg-gray-50 p-3">
          <h3 className="font-semibold text-black mb-2">Today's Progress</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              Completed: {quests.filter((q) => q.completed).length}/{quests.length}
            </span>
            {quests.every((q) => q.completed) && (
              <span className="text-green-600 font-semibold">🎉 All quests done!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
