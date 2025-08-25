"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/pixel95/button"

interface FileItem {
  id: string
  name: string
  type: "folder" | "image" | "note" | "document"
  size?: string
  dateModified: string
  content?: string
}

export function FilesApp() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [currentFolder, setCurrentFolder] = useState("root")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")

  const folderContents: Record<string, FileItem[]> = {
    root: [
      {
        id: "1",
        name: "My Photos",
        type: "folder",
        dateModified: "2024-01-15",
      },
      {
        id: "2",
        name: "Daily Notes",
        type: "folder",
        dateModified: "2024-01-14",
      },
      {
        id: "3",
        name: "Camera Roll",
        type: "folder",
        dateModified: "2024-01-13",
      },
      {
        id: "4",
        name: "profile-pic.jpg",
        type: "image",
        size: "245 KB",
        dateModified: "2024-01-12",
      },
      {
        id: "5",
        name: "streak-goals.txt",
        type: "document",
        size: "1.2 KB",
        dateModified: "2024-01-11",
        content: "My goal is to maintain a 30-day streak on Snel OS!",
      },
    ],
    "1": [
      // My Photos folder
      {
        id: "photo1",
        name: "sunset.jpg",
        type: "image",
        size: "1.2 MB",
        dateModified: "2024-01-15",
      },
      {
        id: "photo2",
        name: "coffee.jpg",
        type: "image",
        size: "856 KB",
        dateModified: "2024-01-14",
      },
      {
        id: "photo3",
        name: "friends.jpg",
        type: "image",
        size: "2.1 MB",
        dateModified: "2024-01-13",
      },
    ],
    "2": [
      // Daily Notes folder
      {
        id: "note1",
        name: "Entry #1",
        type: "note",
        size: "2.3 KB",
        dateModified: "2024-01-15",
        content: "Today was a great day! Started using Snel OS and loving the retro vibes.",
      },
      {
        id: "note2",
        name: "Entry #2",
        type: "note",
        size: "1.8 KB",
        dateModified: "2024-01-14",
        content: "Working on maintaining my daily streak. The quest system is really motivating!",
      },
    ],
    "3": [
      // Camera Roll folder
      {
        id: "cam1",
        name: "IMG_001.jpg",
        type: "image",
        size: "1.5 MB",
        dateModified: "2024-01-15",
      },
      {
        id: "cam2",
        name: "IMG_002.jpg",
        type: "image",
        size: "1.8 MB",
        dateModified: "2024-01-14",
      },
    ],
  }

  useEffect(() => {
    const currentFiles = folderContents[currentFolder] || []
    setFiles(currentFiles)
    setSelectedFile(null) // Clear selection when changing folders
  }, [currentFolder])

  const getFileIcon = (type: string) => {
    switch (type) {
      case "folder":
        return "📁"
      case "image":
        return "🖼️"
      case "note":
        return "📝"
      case "document":
        return "📄"
      default:
        return "📄"
    }
  }

  const handleFileClick = (file: FileItem) => {
    if (file.type === "folder") {
      setCurrentFolder(file.id)
    } else {
      setSelectedFile(selectedFile === file.id ? null : file.id)
    }
  }

  const goBack = () => {
    setCurrentFolder("root")
  }

  const selectedFileData = files.find((f) => f.id === selectedFile)

  const handleDelete = (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      const updatedFiles = files.filter((f) => f.id !== fileId)
      setFiles(updatedFiles)
      localStorage.setItem("snel-user-files", JSON.stringify(updatedFiles))
      setSelectedFile(null)
    }
  }

  return (
    <div className="h-full bg-gray-200 p-4">
      <div className="pixel-border bg-white h-full p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {currentFolder !== "root" && (
              <Button onClick={goBack} className="text-xs">
                ← Back
              </Button>
            )}
            <h2 className="text-lg font-bold text-black">
              {currentFolder === "root"
                ? "My Files"
                : currentFolder === "1"
                  ? "My Photos"
                  : currentFolder === "2"
                    ? "Daily Notes"
                    : currentFolder === "3"
                      ? "Camera Roll"
                      : "My Files"}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="text-xs">
              {viewMode === "grid" ? "List" : "Grid"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className={`pixel-border p-3 cursor-pointer hover:bg-gray-100 ${
                    selectedFile === file.id ? "bg-blue-100" : "bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{getFileIcon(file.type)}</div>
                    <div className="text-xs font-semibold text-black truncate">{file.name}</div>
                    {file.size && <div className="text-xs text-gray-500">{file.size}</div>}
                    <div className="text-xs text-gray-400">{file.dateModified}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedFile === file.id ? "bg-blue-100" : ""
                  }`}
                >
                  <span className="text-lg">{getFileIcon(file.type)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-black">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {file.size && `${file.size} • `}
                      {file.dateModified}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedFileData && (
          <div className="mt-4 pixel-border bg-gray-50 p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-black">{selectedFileData.name}</h3>
              <Button onClick={() => handleDelete(selectedFileData.id)} className="text-xs bg-red-500 text-white">
                Delete
              </Button>
            </div>
            {selectedFileData.content && (
              <div className="text-xs text-gray-700 bg-white p-2 pixel-border max-h-20 overflow-auto">
                {selectedFileData.content}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Type: {selectedFileData.type} • Modified: {selectedFileData.dateModified}
              {selectedFileData.size && ` • Size: ${selectedFileData.size}`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
