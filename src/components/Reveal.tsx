'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  once?: boolean
  delay?: number
}

export default function Reveal({
  children,
  direction = 'up',
  once = true,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) io.unobserve(entry.target)
          } else if (!once) {
            setVisible(false)
          }
        })
      },
      { threshold: 0.12 }
    )

    io.observe(node)
    return () => io.disconnect()
  }, [once])

  const base =
    'transition-all duration-700 ease-out will-change-transform will-change-opacity'
  const hiddenMap = {
    up: 'opacity-0 translate-y-6',
    down: 'opacity-0 -translate-y-6',
    left: 'opacity-0 translate-x-6',
    right: 'opacity-0 -translate-x-6',
  } as const

  const hidden = hiddenMap[direction]
  const shown = 'opacity-100 translate-x-0 translate-y-0'

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${base} ${visible ? shown : hidden}`}
    >
      {children}
    </div>
  )
}
