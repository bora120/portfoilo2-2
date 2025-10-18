'use client'

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'
import Link from 'next/link'
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/* ──────────────────────────────
   ParticleLayer: 상단 캔버스 배경
   ────────────────────────────── */
function ParticleLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mouse = useRef<{ x: number; y: number } | null>(null)
  const particles = useRef<{ x: number; y: number; vx: number; vy: number }[]>(
    []
  )

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    const ctx = canvas.getContext('2d')
    const { width } = wrapper.getBoundingClientRect()
    const height = 72
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx?.scale(dpr, dpr)

    const count = Math.max(16, Math.floor(width / 40))
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
    }))
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width } = wrapper.getBoundingClientRect()
    const height = 72
    ctx.clearRect(0, 0, width, height)

    // 🌸 Pink gradient background
    const grad = ctx.createLinearGradient(0, 0, width, 0)
    grad.addColorStop(0, 'rgba(244,114,182,0.2)')
    grad.addColorStop(0.5, 'rgba(251,113,133,0.18)')
    grad.addColorStop(1, 'rgba(253,164,175,0.18)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    const arr = particles.current
    const m = mouse.current

    for (let i = 0; i < arr.length; i++) {
      const p = arr[i]
      if (m) {
        const dx = p.x - m.x
        const dy = p.y - m.y
        const dist = Math.hypot(dx, dy)
        const radius = 90
        if (dist < radius) {
          const force = (radius - dist) / radius
          p.vx += (dx / dist) * force * 0.6
          p.vy += (dy / dist) * force * 0.6
        }
      }

      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.98
      p.vy *= 0.98
      if (p.x < 0 || p.x > width) p.vx *= -1
      if (p.y < 0 || p.y > height) p.vy *= -1

      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.fill()

      for (let j = i + 1; j < arr.length; j++) {
        const q = arr[j]
        const dx = p.x - q.x
        const dy = p.y - q.y
        const d2 = dx * dx + dy * dy
        if (d2 < 90 * 90) {
          const alpha = 1 - d2 / (90 * 90)
          ctx.strokeStyle = `rgba(244,114,182,${0.14 * alpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
          ctx.stroke()
        }
      }
    }
    requestAnimationFrame(render)
  }, [])

  // 🖱 Mouse move / leave
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const leave = () => (mouse.current = null)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseleave', leave)
    }
  }, [])

  // 📏 Resize + initial render
  useEffect(() => {
    resize()
    render()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [resize, render])

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

/* ──────────────────────────────
   CommandBar: Quick Command Overlay
   ────────────────────────────── */
function CommandBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)

  const commands = useMemo(
    () => [
      { id: 'projects', label: 'projects', path: '/repos' },
      { id: 'learning', label: 'learning', path: '/courses' },
      { id: 'dashboard', label: 'dashboard', path: '/dashboard' },
      { id: 'team', label: 'team', path: '/team' },
      { id: 'profile', label: 'profile', path: '/user' },
    ],
    []
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return commands
    return commands.filter((c) => c.label.includes(q))
  }, [commands, query])

  // ⌨️ Keyboard Shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing =
        ['input', 'textarea'].includes(target.tagName.toLowerCase()) ||
        target.isContentEditable

      if (!open && !typing && e.key === '/') {
        e.preventDefault()
        setOpen(true)
      } else if (open) {
        if (e.key === 'Escape') setOpen(false)
        if (e.key === 'ArrowDown')
          setIndex((i) => Math.min(i + 1, filtered.length - 1))
        if (e.key === 'ArrowUp') setIndex((i) => Math.max(0, i - 1))
        if (e.key === 'Enter') {
          e.preventDefault()
          const cmd = filtered[index]
          if (cmd) {
            router.push(cmd.path)
            setOpen(false)
          }
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, index, router])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-[#141416] px-3 py-1 text-sm text-gray-300 hover:text-white hover:border-pink-500 transition"
      >
        <span className="text-gray-500">/</span> Command
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-gray-800 bg-[#0f0f11] shadow-2xl shadow-black/60"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="border-b border-gray-800 px-4 py-3">
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setIndex(0)
                }}
                placeholder="Type a command…  (/, Esc, ↑/↓, Enter)"
                className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-500"
              />
            </div>

            {/* Command List */}
            <ul className="max-h-72 overflow-y-auto p-2">
              {filtered.map((cmd, i) => (
                <li key={cmd.id}>
                  <button
                    onClick={() => {
                      router.push(cmd.path)
                      setOpen(false)
                    }}
                    onMouseEnter={() => setIndex(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      i === index
                        ? 'bg-pink-600/20 text-gray-100'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {cmd.label}
                  </button>
                </li>
              ))}

              {/* Sign Out */}
              <li className="mt-2 border-t border-gray-800 pt-2">
                <SignOutButton>
                  <button className="w-full text-left px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-500/10 transition">
                    sign out
                  </button>
                </SignOutButton>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  )
}

/* ──────────────────────────────
   Header Component (Main)
   ────────────────────────────── */
export default function Header() {
  const pathname = usePathname()

  const linkClass = useCallback(
    (path: string) =>
      pathname === path ? 'text-pink-400' : 'text-gray-400 hover:text-white',
    [pathname]
  )

  return (
    <header className="sticky top-0 z-50 bg-[#0b0b0c] border-b border-gray-800 shadow-sm shadow-black/30">
      <div className="relative">
        <ParticleLayer />
        <nav
          className="relative max-w-7xl mx-auto flex items-center justify-between px-6 py-4 text-gray-200"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white hover:text-pink-400 transition"
          >
            Main
          </Link>

          <div className="flex items-center gap-4 font-medium">
            <SignedOut>
              <Link href="/courses" className={linkClass('/courses')}>
                Courses
              </Link>
              <SignInButton>
                <button className="rounded-lg bg-pink-600 px-3 py-1 text-white hover:bg-pink-700 transition">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="rounded-lg bg-rose-600 px-3 py-1 text-white hover:bg-rose-700 transition">
                  Sign Up
                </button>
              </SignUpButton>
              <CommandBar />
            </SignedOut>

            <SignedIn>
              <Link href="/repos" className={linkClass('/repos')}>
                Projects
              </Link>
              <Link href="/courses" className={linkClass('/courses')}>
                Learning
              </Link>
              <Link href="/dashboard" className={linkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link href="/team" className={linkClass('/team')}>
                Team
              </Link>

              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      'ring-2 ring-pink-500 hover:ring-rose-500 transition',
                  },
                }}
              />
              <CommandBar />
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  )
}
