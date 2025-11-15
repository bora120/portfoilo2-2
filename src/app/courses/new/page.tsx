// src/app/courses/new/page.tsx

import { createCourse } from '@/actions/courseActions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function NewCoursePage() {
  const createCourseAction = async (formData: FormData) => {
    'use server'

    const title = (formData.get('title') as string)?.trim()
    const description = (formData.get('description') as string)?.trim() || ''
    const level = (formData.get('level') as string)?.trim() || ''
    const category = (formData.get('category') as string)?.trim() || ''
    const link = (formData.get('link') as string)?.trim() || ''

    if (!title) {
      redirect('/courses')
    }

    await createCourse({
      title,
      description,
      level,
      category,
      link,
    })

    redirect('/courses')
  }

  return (
    <main className="min-h-screen bg-transparent text-gray-100">
      <section className="mx-auto max-w-2xl px-6 pt-16 pb-16">
        {/* 상단 제목/설명 */}
        <header className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1 text-[11px] text-pink-200">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            Learning · Add Course
          </div>

          <div>
            <h1 className="section-title text-2xl sm:text-3xl font-semibold text-white">
              새 학습 항목 추가
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-400">
              공부할 강의나 학습 주제를 등록해두고, 러닝 페이지에서 한눈에
              관리할 수 있습니다.
            </p>
          </div>
        </header>

        {/* 입력 폼 */}
        <form action={createCourseAction} className="card-min p-6 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-xs font-medium text-gray-300"
            >
              제목 <span className="text-pink-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              required
              className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-sm text-gray-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              placeholder="예) HTTPS 설정과 인증서 기반 보안"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-xs font-medium text-gray-300"
            >
              설명
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-sm text-gray-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              placeholder="어떤 내용을 배우는 강의인지, 목표나 메모를 적어보세요."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="level"
                className="block text-xs font-medium text-gray-300"
              >
                난이도
              </label>
              <input
                id="level"
                name="level"
                className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-sm text-gray-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                placeholder="Beginner / Intermediate / Advanced"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category"
                className="block text-xs font-medium text-gray-300"
              >
                카테고리
              </label>
              <input
                id="category"
                name="category"
                className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-sm text-gray-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                placeholder="Security / Network / Web / Linux 등"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="link"
              className="block text-xs font-medium text-gray-300"
            >
              링크
            </label>
            <input
              id="link"
              name="link"
              className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-sm text-gray-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              placeholder="인프런, 유튜브, 블로그, GitHub 등 강의 URL"
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Link
              href="/courses"
              className="rounded-xl border border-gray-700 px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-800/80 transition-colors"
            >
              ← 목록으로 돌아가기
            </Link>

            <button
              type="submit"
              className="btn-primary px-5 py-2 text-xs sm:text-sm font-semibold"
            >
              학습 항목 추가하기
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
