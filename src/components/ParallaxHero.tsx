'use client'

import { useEffect, useRef } from 'react'

/**
 * 마우스 움직임에 반응하는 3D 패럴랙스 히어로.
 * - 라이브러리 없이 transform만으로 구현
 * - 과하지 않게 자연스러운 깊이감
 */
export default function ParallaxHero() {
  const refContainer = useRef<HTMLDivElement | null>(null)
  const refLayer1 = useRef<HTMLDivElement | null>(null)
  const refLayer2 = useRef<HTMLDivElement | null>(null)
  const refLayer3 = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    const root = refContainer.current
    if (!root) return

    const onMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width // -0.5 ~ 0.5
      const dy = (e.clientY - cy) / rect.height

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
      className="relative isolate mx-auto max-w-5xl px-6 pt-20 pb-14"
    >
      {/* 빛 레이어 */}
      <div
        ref={refLayer1}
        className="pointer-events-none absolute -inset-x-40 -top-10 -bottom-10 opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(600px 300px at 20% 20%, rgba(255,20,147,0.15), transparent 60%), radial-gradient(700px 360px at 80% 60%, rgba(147,51,234,0.15), transparent 65%)',
          zIndex: 1,
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
        className="relative z-20 mt-2 text-center text-4xl md:text-5xl font-extrabold tracking-tight text-white"
      >
        김가연 <span className="text-pink-400">Portfolio</span>
      </h1>
      {/* 부제 */}
      <p className="relative z-20 mt-3 text-center text-gray-400">
        2005.01.20 · 정보보호학과 2학년 · OO대학교
      </p>
      {/* 얇은 네온 라인 */}
      <div
        className="relative z-10 mx-auto mt-8 h-px w-2/3"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(244,114,182,0.6), transparent)',
        }}
      />
    </section>
  )
}
