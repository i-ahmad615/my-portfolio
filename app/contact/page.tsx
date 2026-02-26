"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send, ArrowLeft, Github, Linkedin } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      })

      if (response.ok) {
        // Email sent successfully!
        setIsSubmitting(false)
        setIsSubmitted(true)

        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false)
          setFormData({ name: "", email: "", subject: "", message: "" })
        }, 3000)

      } else {
        // Something went wrong
        setIsSubmitting(false)
        alert("Something went wrong. Please try again.")
      }

    } catch (error) {
      setIsSubmitting(false)
      alert("Failed to send message. Check your internet connection.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background Dots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20],
              x: [-10, 10],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-8">
          <Link href="/">
            <motion.div
              className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors cursor-pointer"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft size={24} />
              <span className="font-bold">Back to Portfolio</span>
            </motion.div>
          </Link>
        </header>

        <div className="max-w-6xl mx-auto pt-8 md:pt-16 pb-12 md:pb-24 px-4 md:px-8 lg:px-16">
          <motion.h1
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            GET IN TOUCH
          </motion.h1>

          <motion.p
            className="text-xl text-center text-purple-200 mb-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Have a project in mind? Let's discuss how we can bring your vision to life.
          </motion.p>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="mb-12 text-center lg:text-left">
                <div className="w-32 h-32 mx-auto lg:mx-0 mb-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  <img src="/profile.png" alt="Ahmad Sharjeel" className="w-28 h-28 object-cover rounded-full" />
                </div>
                <h2 className="text-3xl font-black mb-2">Ahmad Sharjeel</h2>
                <p className="text-purple-300 text-lg">Creative Developer & Designer</p>
              </div>

              <div className="space-y-6">
                <motion.div
                  className="flex items-center gap-4 p-4 bg-black/30 rounded-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <Mail className="text-purple-400" size={24} />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-purple-200">ahmadsharjeel615@gmail.com</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-4 p-4 bg-black/30 rounded-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <Phone className="text-purple-400" size={24} />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-purple-200">+92 326 0190421</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-4 p-4 bg-black/30 rounded-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <MapPin className="text-purple-400" size={24} />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-purple-200">Lahore, Pakistan</p>
                  </div>
                </motion.div>
              </div>

              <div className="pt-8">
                <h3 className="text-xl font-bold mb-4 text-center lg:text-left">Follow Me</h3>
                <div className="flex gap-4 justify-center lg:justify-start">
                  <motion.a
                    href="https://github.com/i-ahmad615"
                    className="p-3 bg-black/30 rounded-lg backdrop-blur-sm hover:bg-purple-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Github size={24} />
                  </motion.a>
                  <motion.a
                    href="https://www.linkedin.com/in/i-ahmad615/"
                    className="p-3 bg-black/30 rounded-lg backdrop-blur-sm hover:bg-blue-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Linkedin size={24} />
                  </motion.a>
                  <motion.a
                    href="https://wa.me/923260190421?text=Hi%20Ahmad%2C%20I%20came%20across%20your%20portfolio%20and%20would%20love%20to%20discuss%20a%20project%20with%20you!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-black/30 rounded-lg backdrop-blur-sm hover:bg-green-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </motion.a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="bg-black/30 backdrop-blur-sm rounded-2xl p-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {isSubmitted ? (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-purple-200">Thank you for reaching out. I'll get back to you soon!</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-white placeholder-gray-400"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-white placeholder-gray-400"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-white placeholder-gray-400"
                      placeholder="Project inquiry"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-white placeholder-gray-400 resize-none"
                      placeholder="Tell me about your project..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
