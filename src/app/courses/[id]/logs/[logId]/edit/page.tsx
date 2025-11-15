// src/app/courses/[id]/logs/[logId]/edit/page.tsx

import { notFound, redirect } from 'next/navigation'
import { getLogsByCourseId, updateStudyLog } from '@/actions/studyLogActions'

export default async function EditLogPage({
  params,
}: {
  params: Promise<{ id: string; logId: string }>
}) {
  // Next.js 15: params 는 Promise
  const { id: courseId, logId } = await params

  const logs = await getLogsByCourseId(courseId)
  const log = logs.find((l) => l.id === logId)

  if (!log) {
    notFound()
  }

  const updateAction = async (formData: FormData) => {
    'use server'

    const title = (formData.get('title') as string)?.trim()
    const content = (formData.get('content') as string)?.trim()

    if (!title || !content) {
      redirect(`/courses/${courseId}`)
    }

    await updateStudyLog(logId, { title: title!, content: content! })
    redirect(`/courses/${courseId}`)
  }

  return (
    <main className="min-h-screen bg-transparent text-gray-100">
      <section className="max-w-2xl mx-auto px-6 pt-16 pb-20">
        <h1 className="text-xl font-semibold mb-6">학습 기록 수정</h1>

        <form action={updateAction} className="card-min p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-[11px] text-gray-300">제목</label>
            <input
              name="title"
              defaultValue={log.title}
              className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-sm text-gray-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-gray-300">내용</label>
            <textarea
              name="content"
              rows={6}
              defaultValue={log.content}
              className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-sm text-gray-100"
            />
          </div>

          <button className="btn-primary w-full py-2 text-sm font-semibold">
            수정 완료
          </button>
        </form>
      </section>
    </main>
  )
}
