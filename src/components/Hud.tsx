'use client'

import { useEffect, useRef } from 'react'

export default function Hud() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn = (navigator as any).connection
    const cores = navigator.hardwareConcurrency || 4
    let last = performance.now()
    let frames = 0
    let raf = 0

    const loop = () => {
      frames++
      const now = performance.now()
      if (now - last >= 1000) {
        const fps = frames
        frames = 0
        last = now
        const ping = typeof conn?.rtt === 'number' ? `${conn.rtt}ms` : 'net ok'
        el.textContent = `⚙️ ${fps} FPS | CPU ${cores}-core | ${ping}`
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={ref}
      className="fixed top-20 right-6 z-30 text-xs text-gray-400 font-mono bg-[#0b0b0c]/70 border border-gray-900/60 px-3 py-1.5 rounded-lg backdrop-blur-sm pointer-events-none shadow-lg shadow-black/20"
      aria-live="polite"
    />
  )
}
