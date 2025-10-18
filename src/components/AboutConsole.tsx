'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

/* ──────────────────────────────
   Types
   ────────────────────────────── */
type AboutConsoleProps = {
  email: string | null
  about: {
    phone: string
    instagram: string
    github: string
    school: string
    major: string
    learning: string[]
    tools: string[]
    interests: string[]
  }
}

type Line =
  | { id: number; kind: 'cmd'; text: string }
  | { id: number; kind: 'out'; node: React.ReactNode }

const SUPPORTED = [
  'whoami',
  'contact',
  'profiles',
  'edu',
  'learning',
  'tools',
  'interests',
  'clear',
  'help',
] as const

/* ──────────────────────────────
   AboutConsole Component
   ────────────────────────────── */
export default function AboutConsole({ email, about }: AboutConsoleProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const nextId = useRef(1)
  const autoplayTimer = useRef<number | null>(null)

  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const [autoScriptDone, setAutoScriptDone] = useState(false)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  /* ────────────────
       Helper Functions
       ──────────────── */
  const addCmd = useCallback((text: string) => {
    setLines((prev) => [
      ...prev,
      { id: nextId.current++, kind: 'cmd', text: `> ${text}` },
    ])
  }, [])

  const addOut = useCallback((node: React.ReactNode) => {
    setLines((prev) => [...prev, { id: nextId.current++, kind: 'out', node }])
  }, [])

  const clearAll = useCallback(() => setLines([]), [])

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      const el = wrapRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [])

  useEffect(scrollToEnd, [lines.length])

  /* ────────────────
       Command Runner
       ──────────────── */
  const runCommand = useCallback(
    (cmdRaw: string) => {
      const cmd = cmdRaw.trim().toLowerCase()
      if (!cmd) return
      addCmd(cmdRaw)

      switch (cmd) {
        case 'whoami':
          addOut(
            <div className="text-pink-300">
              김가연{' '}
              <span className="text-gray-400">/ Frontend · Security</span>
            </div>
          )
          break

        case 'contact':
          addOut(
            <div className="space-y-1">
              <div>
                <span className="text-gray-400">📞 Phone:</span>{' '}
                <span className="text-gray-200">{safeVal(about.phone)}</span>
              </div>
              <div>
                <span className="text-gray-400">✉️ Email:</span>{' '}
                {email ? (
                  <a className="link" href={`mailto:${email}`}>
                    {email}
                  </a>
                ) : (
                  <span className="text-gray-200">—</span>
                )}
              </div>
            </div>
          )
          break

        case 'profiles':
          addOut(
            <div className="space-y-1">
              <div>
                <span className="text-gray-400">💻 GitHub:</span>{' '}
                {linkOrDash(about.github)}
              </div>
              <div>
                <span className="text-gray-400">📸 Instagram:</span>{' '}
                {linkOrDash(about.instagram)}
              </div>
            </div>
          )
          break

        case 'edu':
          addOut(
            <div>
              <span className="text-gray-200">{about.school}</span>
              <span className="text-gray-500">{' · '}</span>
              <span className="text-gray-200">{about.major}</span>
            </div>
          )
          break

        case 'learning':
          addOut(<Pills items={about.learning} />)
          break

        case 'tools':
          addOut(<Pills items={about.tools} />)
          break

        case 'interests':
          addOut(<Pills items={about.interests} />)
          break

        case 'help':
          addOut(
            <div className="text-gray-300">
              available:&nbsp;
              <span className="text-gray-400">{SUPPORTED.join(', ')}</span>
            </div>
          )
          break

        case 'clear':
          clearAll()
          break

        default:
          addOut(
            <div className="text-rose-300">
              unknown command: <span className="text-rose-200">{cmdRaw}</span>
            </div>
          )
      }
    },
    [about, email, addCmd, addOut, clearAll]
  )

  /* ────────────────
       Helpers (links / safe values)
       ──────────────── */
  const linkOrDash = useCallback(
    (url: string) =>
      url && url !== '—' ? (
        <a
          className="link break-all"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>
      ) : (
        <span className="text-gray-200">—</span>
      ),
    []
  )

  const safeVal = (v: string) => (v && v !== '—' ? v : '—')

  /* ────────────────
       Input Handler
       ──────────────── */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = input.trim()
    if (!v) return
    setAutoScriptDone(true)
    runCommand(v)
    setInput('')
  }

  /* ────────────────
       AutoPlay (Intro Showcase)
       ──────────────── */
  useEffect(() => {
    if (autoScriptDone) return

    const script = [
      'whoami',
      'contact',
      'profiles',
      'edu',
      'learning',
      'tools',
      'interests',
      'help',
    ]
    let idx = 0

    const play = () => {
      if (idx >= script.length) return
      runCommand(script[idx++])
      const delay = prefersReduced ? 200 : 550
      autoplayTimer.current = window.setTimeout(play, delay)
    }

    addOut(
      <div className="text-[11px] text-gray-500">
        Neon Console — type <span className="text-gray-300">help</span> to list
        commands
      </div>
    )

    const startDelay = prefersReduced ? 50 : 350
    autoplayTimer.current = window.setTimeout(play, startDelay)

    return () => {
      if (autoplayTimer.current) clearTimeout(autoplayTimer.current)
    }
  }, [autoScriptDone, runCommand, addOut, prefersReduced])

  /* ────────────────
       Render
       ──────────────── */
  return (
    <section
      aria-labelledby="about-console"
      className="mx-auto max-w-5xl px-6 pt-16 pb-12"
    >
      <h2
        id="about-console"
        className="section-title text-2xl font-semibold mb-4 text-white"
      >
        About
      </h2>

      {/* Terminal Frame */}
      <div className="rounded-2xl border border-gray-800 bg-[#0b0b0c]/80 backdrop-blur-md shadow-[0_0_30px_rgba(244,114,182,0.15)]">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <p className="text-[11px] text-gray-500 font-mono">
            /about/console — read-only
          </p>
        </div>

        {/* Viewport */}
        <div
          ref={wrapRef}
          className="max-h-[420px] overflow-auto px-4 py-4 font-mono text-[13px] leading-6 text-gray-200"
          aria-live="polite"
        >
          {lines.map((ln) =>
            ln.kind === 'cmd' ? (
              <div key={ln.id} className="text-pink-300">
                {ln.text}
              </div>
            ) : (
              <div key={ln.id} className="text-gray-200">
                {ln.node}
              </div>
            )
          )}
        </div>

        {/* Input Row */}
        <form
          onSubmit={onSubmit}
          className="border-t border-gray-800 px-4 py-3 flex items-center gap-2"
        >
          <span className="text-pink-400 font-mono text-[13px] select-none">
            &gt;
          </span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`type a command (${SUPPORTED.join(', ')})`}
            className="flex-1 bg-transparent outline-none placeholder:text-gray-600 text-gray-100 text-[13px] font-mono"
            aria-label="Console command input"
          />
          <button
            type="submit"
            className="rounded-lg border border-gray-800 bg-[#141416] px-3 py-1 text-xs text-gray-300 hover:text-white hover:border-pink-500 transition"
          >
            run
          </button>
        </form>
      </div>
    </section>
  )
}

/* ──────────────────────────────
   Pills (tags for skills/tools)
   ────────────────────────────── */
function Pills({ items }: { items: string[] }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <span
          key={it}
          className="rounded-full border border-gray-700 bg-white/5 px-3 py-1 text-gray-200 text-[12px] hover:border-pink-500 transition"
        >
          {it}
        </span>
      ))}
    </div>
  )
}
