import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ahmad Sharjeel - Portfolio",
  description: "Portfolio of Ahmad Sharjeel - Agentic AI & Full Stack Developer",
  generator: 'v0.dev',
  icons: {
    icon: '/profile.png',
    apple: '/profile.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
