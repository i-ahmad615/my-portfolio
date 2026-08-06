"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import type { ChatMessage } from "../../types/chat"

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="hidden sm:flex w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed break-words ${
          isUser
            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl rounded-br-sm"
            : "bg-white/10 backdrop-blur-md border border-white/20 text-gray-100 rounded-2xl rounded-bl-sm"
        }`}
      >
        {message.text}
      </div>
    </motion.div>
  )
}
