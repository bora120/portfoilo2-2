// src/app/courses/[id]/page.tsx

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCourseById } from '@/actions/courseActions'
import { createStudyLog, getLogsByCourseId } from '@/actions/studyLogActions'
import StudyLogList from '@/components/StudyLogList'
import CourseCompleteToggle from '@/components/CourseCompleteToggle'
import CourseDeleteButton from '@/components/CourseDeleteButton'

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id: courseId } = params

  const course = await getCourseById(courseId)

  if (!course) {
    notFound()
  }

  const logs = await getLogsByCourseId(courseId)

  // 학습 기록 작성용 서버 액션
  const createLogAction = async (formData: FormData) => {
    'use server'

    const title = (formData.get('title') as string)?.trim()
    const content = (formData.get('content') as string)?.trim()

    if (!title || !content) {
      redirect(`/courses/${courseId}`)
    }

    await createStudyLog({
      courseId,
      title: title!,
      content: content!,
    })

    redirect(`/courses/${courseId}`)
  }

  const completed =
    typeof course.completed === 'boolean' ? course.completed : false

  const link = typeof course.link === 'string' ? course.link.trim() : ''

  const hasLink = link.length > 0 && /^(https?:)?\/\//.test(link)

  return (
    <main className="min-h-screen bg-transparent text-gray-100">
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-16 space-y-8">
        {/* 상단 제목/설명 */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1 text-[11px] text-pink-200">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            Learning · Study Detail
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="section-title text-2xl sm:text-3xl font-semibold text-white">
                {course.title}
              </h1>
              {course.description && (
                <p className="mt-1 text-sm text-gray-400">
                  {course.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                {course.level && (
                  <span className="rounded-full border border-gray-700 px-2 py-0.5">
                    Level · {course.level}
                  </span>
                )}
                {course.category && (
                  <span className="rounded-full border border-gray-700 px-2 py-0.5">
                    {course.category}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <CourseCompleteToggle id={courseId} completed={completed} />

                <Link
                  href={`/courses/${courseId}/edit`}
                  className="rounded-xl border border-gray-700 px-3 py-1 text-[11px] text-gray-300 hover:bg-gray-800/80 transition-colors"
                >
                  수정
                </Link>

                <CourseDeleteButton id={courseId} />
              </div>

              <Link
                href="/courses"
                className="text-[11px] text-gray-400 hover:text-gray-200 underline-offset-4 hover:underline"
              >
                ← 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </header>

        {/* 강의 정보 카드 */}
        <div className="card-min p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-gray-100">강의 정보</h2>
            {hasLink && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md hover:from-pink-700 hover:to-fuchsia-700 transition-all"
              >
                강의 바로가기 →
              </a>
            )}
          </div>

          <ul className="space-y-1 text-xs text-gray-400">
            {course.level && (
              <li>
                <span className="text-gray-500">난이도: </span>
                {course.level}
              </li>
            )}
            {course.category && (
              <li>
                <span className="text-gray-500">카테고리: </span>
                {course.category}
              </li>
            )}
            {link && (
              <li className="break-all">
                <span className="text-gray-500">링크: </span>
                {link}
              </li>
            )}
            {course.createdAt && (
              <li>
                <span className="text-gray-500">등록일: </span>
                {new Date(course.createdAt as Date).toLocaleString('ko-KR')}
              </li>
            )}
          </ul>
        </div>

        {/* 학습 기록 섹션 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* 기록 리스트 */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-100">학습 기록</h2>
            <StudyLogList logs={logs} />
          </div>

          {/* 기록 작성 폼 */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-100">
              새 기록 작성
            </h2>
            <form action={createLogAction} className="card-min p-4 space-y-3">
              <div className="space-y-1">
                <label
                  htmlFor="title"
                  className="block text-[11px] font-medium text-gray-300"
                >
                  제목
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-xs text-gray-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="예) HTTPS 설정 정리, 실습 오류 해결 과정"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="content"
                  className="block text-[11px] font-medium text-gray-300"
                >
                  내용
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={5}
                  required
                  className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-xs text-gray-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="배운 내용, 실습 과정, 막혔던 부분과 해결 방법 등을 자유롭게 기록해보세요."
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2 text-xs font-semibold"
              >
                학습 기록 저장하기
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
