"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { X, Sparkles } from "lucide-react"
import MessageBubble from "./MessageBubble"
import ChatInput from "./ChatInput"
import type { ChatMessage } from "../../types/chat"

export default function ChatWindow({
  messages,
  isTyping,
  onSend,
  onClose,
}: {
  messages: ChatMessage[]
  isTyping: boolean
  onSend: (text: string) => void
  onClose: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 2, 0.6, 1] }}
      className="fixed bottom-24 right-4 z-[60] w-[min(380px,calc(100vw-2rem))] h-[min(70vh,600px,calc(100vh-7.5rem))] flex flex-col bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Portfolio Assistant</p>
            <p className="text-purple-300 text-xs">Ask about Ahmad's work</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="text-white/60 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="flex gap-1 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl rounded-bl-sm">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-300"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <ChatInput onSend={onSend} disabled={isTyping} />
    </motion.div>
  )
}
