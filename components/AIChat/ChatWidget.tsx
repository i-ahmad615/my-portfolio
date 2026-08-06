"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { AnimatePresence } from "framer-motion"
import ChatWindow from "./ChatWindow"
import type { ChatMessage } from "../../types/chat"
import profile from "../../content/profile.json"
import type { Profile } from "../../types/content"

// Loaded client-side only, on its own chunk, so the avatar video never
// factors into the initial page bundle or first paint.
const AvatarWidget = dynamic(() => import("../AIAvatar/AvatarWidget"), { ssr: false })

const typedProfile = profile as Profile

let idCounter = 0
function nextId() {
  idCounter += 1
  return `msg-${Date.now()}-${idCounter}`
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      role: "assistant",
      text: `Hi! I'm ${typedProfile.name}'s assistant. How can I help you?`,
      timestamp: Date.now(),
    },
  ])
  const handleSend = async (text: string) => {
    const userMessage: ChatMessage = {
      id: nextId(),
      role: "user",
      text,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok || typeof data?.reply !== "string") {
        throw new Error(data?.error || "Failed to get a response.")
      }

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", text: data.reply, timestamp: Date.now() },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          text: "Sorry, I couldn't reach the assistant right now. Please try again in a moment.",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            onSend={handleSend}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* The avatar's idle loop stops the moment this unmounts (chat opens),
            and resumes automatically when it remounts (chat closes). */}
        {!isOpen && <AvatarWidget onOpen={() => setIsOpen(true)} />}
      </AnimatePresence>
    </>
  )
}
