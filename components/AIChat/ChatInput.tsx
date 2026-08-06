"use client"

import { useState } from "react"
import type React from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void
  disabled?: boolean
}) {
  const [value, setValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t border-white/10 bg-black/40 backdrop-blur-md rounded-b-2xl"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask me anything..."
        disabled={disabled}
        className="flex-1 px-4 py-2.5 bg-black/50 border border-purple-500/30 rounded-full text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors disabled:opacity-50"
      />
      <motion.button
        type="submit"
        disabled={disabled || !value.trim()}
        whileHover={{ scale: disabled ? 1 : 1.08 }}
        whileTap={{ scale: disabled ? 1 : 0.92 }}
        className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        aria-label="Send message"
      >
        <Send size={16} />
      </motion.button>
    </form>
  )
}
