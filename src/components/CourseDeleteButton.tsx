// src/components/CourseDeleteButton.tsx
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCourse } from '@/actions/courseActions'

interface CourseDeleteButtonProps {
  id: string
}

export default function CourseDeleteButton({ id }: CourseDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    if (!confirm('정말로 이 학습 항목을 삭제할까요? 되돌릴 수 없습니다.')) {
      return
    }

    startTransition(async () => {
      try {
        await deleteCourse(id)
        router.push('/courses')
        router.refresh()
      } catch (error) {
        console.error('Failed to delete course:', error)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-xl border border-red-500/40 bg-red-500/5 px-3 py-1 text-[11px] text-red-200 hover:bg-red-500/10 transition-colors"
    >
      {isPending ? '삭제 중...' : '삭제'}
    </button>
  )
}
