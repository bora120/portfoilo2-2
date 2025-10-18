'use client'

import { useEffect, useRef } from 'react'

type Pulse = { x: number; y: number; r: number; alpha: number }

export default function BackgroundMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pulsesRef = useRef<Pulse[]>([])
  const rafRef = useRef<number | null>(null)
  const lastScrollY = useRef<number>(0)
  const lastTS = useRef<number>(0)

  // 캔버스 리사이즈
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      const ctx = canvas.getContext('2d')
      ctx?.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // 클릭 파동 생성
  useEffect(() => {
    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (prefersReduced) return

    const onClick = (e: MouseEvent) => {
      pulsesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        r: 0,
        alpha: 0.4,
      })
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  // 마우스 이동 → 배경 방향성 추가
  useEffect(() => {
    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (prefersReduced) return

    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 2 // -1 ~ 1
      document.documentElement.style.setProperty('--gy-shiftX', `${dx * 6}px`)
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // 스크롤 속도 → 애니메이션 속도 가중치
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const dy = Math.abs(y - lastScrollY.current)
      lastScrollY.current = y
      // 0.8 ~ 1.3 범위로 가볍게 조절
      const speed = Math.max(0.8, Math.min(1.3, 0.8 + dy / 600))
      document.documentElement.style.setProperty('--gy-speed', String(speed))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 파동 렌더 루프
  const tick = (ts: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 30~60fps 범위로 자연스레
    const dt = Math.min(33, ts - (lastTS.current || ts))
    lastTS.current = ts

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 부드러운 네온 파동 (여러 개 동시)
    pulsesRef.current.forEach((p) => {
      p.r += (220 * dt) / 1000 // 확장 속도
      p.alpha *= 0.98
      // 링
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(244,114,182,${p.alpha})`
      ctx.lineWidth = 2
      ctx.stroke()
      // 내부 글로우
      const grd = ctx.createRadialGradient(p.x, p.y, p.r * 0.5, p.x, p.y, p.r)
      grd.addColorStop(0, 'rgba(244,114,182,0.08)')
      grd.addColorStop(1, 'rgba(244,114,182,0)')
      ctx.fillStyle = grd
      ctx.fill()
    })

    // 사라진 파동 제거
    pulsesRef.current = pulsesRef.current.filter((p) => p.alpha > 0.02)

    if (pulsesRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      rafRef.current = null
    }
  }

  return (
    <div aria-hidden className="gy-bg-wrap">
      {/* 다층 그라데이션 (속도/방향 다르게) */}
      <div className="gy-bg-layer gy-bg-a" />
      <div className="gy-bg-layer gy-bg-b" />
      <div className="gy-bg-layer gy-bg-c" />
      {/* 네트워크 파동 캔버스 */}
      <canvas ref={canvasRef} className="gy-pulse-canvas" />
    </div>
  )
}
