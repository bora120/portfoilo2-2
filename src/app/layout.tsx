// src/app/layout.tsx

import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import Header from '@/components/Header'
import BackgroundMotion from '@/components/BackgroundMotion'
import Hud from '@/components/Hud'

/* ──────────────────────────────
   Google Fonts (Geist Sans / Mono)
   ────────────────────────────── */
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

/* ──────────────────────────────
   Metadata
   ────────────────────────────── */
export const metadata: Metadata = {
  title: 'Kayun’s Portfolio',
  description: '김가연의 포트폴리오 페이지',
}

/* ──────────────────────────────
   Root Layout
   - 전역 구조: Provider → HTML → Body
   - 구성: Background / Header / Hud / Main
   ────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased relative overflow-x-hidden bg-[#0b0b0c] text-gray-100`}
        >
          {/* 🌌 Background Layer (네온 필드) */}
          <BackgroundMotion />

          {/* 🧭 Header (Top Navigation) */}
          <Header />

          {/* ⚙️ HUD Overlay (z-40) */}
          <Hud />

          {/* 🧩 Main Content */}
          <main className="relative z-10 min-h-screen bg-transparent">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}
