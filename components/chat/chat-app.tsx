"use client"

import { useState } from "react"
import { Button } from "@/components/pixel95/button"

interface Message {
  id: string
  user: string
  content: string
  time: string
  room: string // Added room tracking for messages
}

export function ChatApp() {
  const [currentRoom, setCurrentRoom] = useState("lobby")
  const [message, setMessage] = useState("")
  const [allMessages, setAllMessages] = useState<Message[]>([
    { id: "1", user: "System", content: "Welcome to the lobby!", time: "12:00", room: "lobby" },
    { id: "2", user: "Alice", content: "Hey everyone! 👋", time: "12:01", room: "lobby" },
    { id: "3", user: "Bob", content: "Good morning!", time: "12:02", room: "lobby" },
    { id: "4", user: "System", content: "Welcome to the build room!", time: "12:00", room: "build" },
    { id: "5", user: "Charlie", content: "Working on my new app 🚀", time: "12:03", room: "build" },
    { id: "6", user: "System", content: "Share your creations here!", time: "12:00", room: "show-n-tell" },
    { id: "7", user: "Diana", content: "Check out my latest project!", time: "12:04", room: "show-n-tell" },
  ])

  const rooms = [
    { id: "lobby", name: "Lobby", description: "General chat" },
    { id: "build", name: "Build", description: "Development talk" },
    { id: "show-n-tell", name: "Show & Tell", description: "Share your work" },
  ]

  const currentMessages = allMessages.filter((msg) => msg.room === currentRoom)

  const switchRoom = (roomId: string) => {
    console.log("[v0] Switching to room:", roomId)
    setCurrentRoom(roomId)
  }

  const sendMessage = () => {
    if (message.trim() && message.length <= 180) {
      const newMessage: Message = {
        id: Date.now().toString(),
        user: "You",
        content: message,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        room: currentRoom, // Associate message with current room
      }
      setAllMessages((prev) => [...prev, newMessage])
      setMessage("")
    }
  }

  return (
    <div className="h-full bg-gray-200 p-4">
      <div className="pixel-border bg-white h-full p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-black mb-2">Chat Rooms</h2>
          <div className="flex gap-2 flex-wrap">
            {rooms.map((room) => (
              <Button
                key={room.id}
                onClick={() => switchRoom(room.id)}
                className={`text-xs ${currentRoom === room.id ? "bg-blue-500 text-white" : ""}`}
                title={room.description}
              >
                {room.name}
              </Button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Current: {rooms.find((r) => r.id === currentRoom)?.description}
          </div>
        </div>

        <div className="flex-1 pixel-border bg-gray-100 p-2 mb-4 overflow-y-auto">
          {currentMessages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <span className="font-bold text-blue-600">{msg.user}</span>
              <span className="text-gray-500 text-sm ml-2">{msg.time}</span>
              <div className="text-black">{msg.content}</div>
            </div>
          ))}
          {currentMessages.length === 0 && (
            <div className="text-gray-500 text-center">
              No messages in this room yet. Be the first to say something!
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 180))}
            placeholder={`Type a message in ${rooms.find((r) => r.id === currentRoom)?.name}...`}
            className="flex-1 p-2 pixel-border text-black"
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
        <div className="text-xs text-gray-500 mt-1">{message.length}/180 characters</div>
      </div>
    </div>
  )
}
