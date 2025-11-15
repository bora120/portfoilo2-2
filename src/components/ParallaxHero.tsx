'use client'

import { useEffect, useRef } from 'react'

export default function ParallaxHero() {
  const refContainer = useRef<HTMLDivElement | null>(null)
  const refLayer1 = useRef<HTMLDivElement | null>(null) // light
  const refLayer2 = useRef<HTMLDivElement | null>(null) // subtitle
  const refLayer3 = useRef<HTMLHeadingElement | null>(null) // title

  useEffect(() => {
    const root = refContainer.current
    if (!root) return

    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false

    // 인트로 등장
    root.classList.add('hero-reveal')

    const onMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width // -0.5 ~ 0.5
      const dy = (e.clientY - cy) / rect.height

      // tilt (살짝 기울이기)
      if (!prefersReduced && !coarse) {
        const tiltX = dy * -8
        const tiltY = dx * 10
        root.style.setProperty('--tiltX', `${tiltX}deg`)
        root.style.setProperty('--tiltY', `${tiltY}deg`)
        root.style.setProperty('--glowX', `${dx * 50}%`)
        root.style.setProperty('--glowY', `${dy * 50}%`)
      }

      // 각 레이어별 민감도
      refLayer1.current &&
        (refLayer1.current.style.transform = `translate3d(${dx * 12}px, ${
          dy * 10
        }px, 0)`)
      refLayer2.current &&
        (refLayer2.current.style.transform = `translate3d(${dx * -18}px, ${
          dy * -14
        }px, 0)`)
      refLayer3.current &&
        (refLayer3.current.style.transform = `translate3d(${dx * 6}px, ${
          dy * -4
        }px, 0)`)
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section
      ref={refContainer}
      className="relative isolate mx-auto max-w-5xl px-6 pt-20 pb-14 will-change-transform"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        // tilt 적용
        transform: 'rotateX(var(--tiltX, 0deg)) rotateY(var(--tiltY, 0deg))',
      }}
    >
      {/* 빛 레이어 (glow gradient) */}
      <div
        ref={refLayer1}
        className="pointer-events-none absolute -inset-x-40 -top-10 -bottom-10 opacity-80 blur-3xl"
        style={{
          background:
            'radial-gradient(600px 300px at 20% 20%, rgba(255,20,147,0.14), transparent 60%), radial-gradient(700px 360px at 80% 60%, rgba(147,51,234,0.14), transparent 65%)',
          zIndex: 1,
          maskImage:
            'radial-gradient(300px 140px at var(--glowX, 50%) var(--glowY, 50%), rgba(0,0,0,1), transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(300px 140px at var(--glowX, 50%) var(--glowY, 50%), rgba(0,0,0,1), transparent 70%)',
        }}
      />

      {/* 서브 타이틀 */}
      <div ref={refLayer2} className="relative z-20 text-center">
        <p className="text-sm tracking-wide text-pink-300/80">
          Security & Frontend
        </p>
      </div>

      {/* 메인 타이틀 */}
      <h1
        ref={refLayer3}
        className="relative z-20 mt-2 text-center text-4xl md:text-5xl font-extrabold tracking-tight text-white neon typewriter"
        style={{
          transform: 'translateZ(20px)',
        }}
      >
        KIMKAYUN <span className="text-pink-400">Portfolio</span>
      </h1>

      {/* 부제 */}
      <p className="relative z-20 mt-3 text-center text-gray-400">
        2005.01.20 · 정보보호학과 2학년 · 중부대학교
      </p>

      {/* 얇은 네온 라인 */}
      <div
        className="relative z-10 mx-auto mt-8 h-px w-2/3"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(244,114,182,0.7), transparent)',
          boxShadow: '0 0 12px rgba(244,114,182,0.4)',
        }}
      />
    </section>
  )
}
