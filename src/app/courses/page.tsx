import Courses from '@/components/Courses'
import type { Course } from '@/types/course'
import coursesData from '../api/courses/data.json'

export default function CoursesPage() {
  const courses: Course[] = coursesData

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-gray-100">
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-14">
        {/* 상단 제목/설명 */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold mb-4 tracking-normal">
            Learning
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            보안, 네트워크, 개발 관련 학습 내용을 기록한 페이지입니다. 각 항목은
            학습 주제, 난이도, 실습 요약, 참고 자료를 포함합니다.
          </p>
        </header>

        {/* 강의 카드 목록 */}
        {courses.length > 0 ? <Courses courses={courses} /> : <EmptyState />}
      </section>
    </main>
  )
}

/* ───────────── 데이터가 없을 때 표시 ───────────── */
function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-700 bg-[#161616] p-10 text-center shadow-inner shadow-black/20">
      <h3 className="font-semibold mb-3 text-gray-200 text-lg">
        등록된 학습 기록이 없습니다.
      </h3>
      <p className="text-sm text-gray-500">
        <code className="text-violet-400">data.json</code> 파일에 새 학습 주제를
        추가해보세요.
      </p>
    </div>
  )
}
