// src/app/courses/page.tsx

import Courses from '@/components/Courses'
import type { Course } from '@/types/course'
import { getAllCourses } from '@/actions/courseActions'
export const dynamic = 'force-dynamic'

// DB에서 강의 목록을 가져오는 서버 컴포넌트
export default async function CoursesPage() {
  let courses: Course[] = []

  try {
    const dbCourses = await getAllCourses()
    // Server Action에서 받은 데이터를 Course[]로 맞춰 사용
    courses = dbCourses as Course[]
  } catch (error) {
    console.error('Failed to load courses from database:', error)
    courses = []
  }

  const hasCourses = Array.isArray(courses) && courses.length > 0

  return (
    <main className="min-h-screen bg-transparent text-gray-100">
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-16">
        {/* 상단 제목/설명 - Projects/Team와 같은 패턴 */}
        <header className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1 text-[11px] text-pink-200">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            Learning · Study Log
          </div>

          <div>
            <h1 className="section-title text-2xl sm:text-3xl font-semibold text-white">
              Learning
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-400">
              보안, 네트워크, 개발 관련 학습 내용을 정리한 페이지입니다. 각
              항목은 학습 주제, 난이도, 실습 요약, 참고 자료를 포함합니다.
            </p>
          </div>
        </header>

        {/* 강의 카드 목록 */}
        {hasCourses ? (
          <div className="space-y-4">
            <Courses courses={courses} />
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </main>
  )
}

/* ───────────── 데이터가 없을 때 표시 ───────────── */
function EmptyState() {
  return (
    <div className="card-min p-8 text-center">
      <h3 className="font-semibold mb-3 text-gray-200 text-lg">
        등록된 학습 기록이 없습니다.
      </h3>
      <p className="text-sm text-gray-500">
        <code className="text-pink-300">data.json</code> 파일에 새 학습 주제를
        추가해보세요.
      </p>
    </div>
  )
}
