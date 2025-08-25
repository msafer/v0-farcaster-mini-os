"use client"

import { useState } from "react"
import { Button } from "@/components/pixel95/button"

interface Note {
  id: string
  content: string
  date: string
  number: number
}

export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState("")

  const addNote = () => {
    if (currentNote.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        content: currentNote,
        date: new Date().toLocaleDateString(),
        number: notes.length + 1,
      }
      setNotes((prev) => [newNote, ...prev])
      setCurrentNote("")
    }
  }

  return (
    <div className="h-full bg-gray-200 p-4">
      <div className="pixel-border bg-white h-full p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4 text-black">Notes</h2>

        <div className="mb-4">
          <textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            placeholder="Write your thoughts..."
            className="w-full h-24 p-2 pixel-border resize-none text-black"
          />
          <Button onClick={addNote} className="mt-2">
            Add Note
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="pixel-border bg-gray-100 p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-black">#{note.number}</span>
                <span className="text-sm text-gray-600">{note.date}</span>
              </div>
              <p className="text-black">{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
