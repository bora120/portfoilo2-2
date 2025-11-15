// src/components/StudyLogDeleteButton.tsx
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteStudyLog } from '@/actions/studyLogActions'

export default function DeleteLogButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    if (!confirm('정말 이 학습 기록을 삭제할까요?')) return

    startTransition(async () => {
      try {
        await deleteStudyLog(id)
        router.refresh()
      } catch (error) {
        console.error('Failed to delete study log:', error)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-md px-2 py-1 border border-red-500/30 text-red-300 hover:bg-red-500/10 transition"
    >
      {isPending ? '삭제중' : '삭제'}
    </button>
  )
}
