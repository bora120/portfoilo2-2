// src/components/CourseCompleteToggle.tsx
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleCourseCompleted } from '@/actions/courseActions'

interface CourseCompleteToggleProps {
  id: string
  completed?: boolean
}

export default function CourseCompleteToggle({
  id,
  completed,
}: CourseCompleteToggleProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const label = completed ? '완료됨' : '미완료'
  const title = completed ? '학습 완료 상태입니다.' : '아직 학습 중입니다.'

  const handleClick = () => {
    startTransition(async () => {
      try {
        await toggleCourseCompleted(id)
        router.refresh()
      } catch (error) {
        console.error('Failed to toggle completed state:', error)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={title}
      className={`rounded-xl border px-3 py-1 text-[11px] transition-colors ${
        completed
          ? 'border-pink-500/60 bg-pink-500/10 text-pink-200'
          : 'border-gray-700 bg-black/20 text-gray-400 hover:border-pink-500/60 hover:text-pink-200'
      }`}
    >
      {isPending ? '저장 중...' : label}
    </button>
  )
}
