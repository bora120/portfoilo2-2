// src/app/layout.tsx
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import BackgroundMotion from '@/components/BackgroundMotion'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'GaYeon’s Portfolio',
  description: '김가연의 포트폴리오 페이지',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased relative overflow-x-hidden bg-[#0b0b0c] text-gray-100`}
        >
          {/* 🌌 배경 레이어 */}
          <BackgroundMotion />

          {/* 🧭 헤더 */}
          <Header />

          {/* 🧩 메인 콘텐츠 */}
          <main className="relative z-10 min-h-screen bg-transparent">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}
