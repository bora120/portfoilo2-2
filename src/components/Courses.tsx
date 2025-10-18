import Link from 'next/link'
import type { Course } from '@/types/course'

interface CoursesProps {
  courses: Course[]
}

export default function Courses({ courses }: CoursesProps) {
  return (
    <div
      aria-label="Courses list"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}

/* ───────────── 개별 강의 카드 ───────────── */
function CourseCard({ course }: { course: Course }) {
  const hasLink =
    typeof course.link === 'string' &&
    course.link.trim().length > 0 &&
    /^(https?:)?\/\//.test(course.link)

  return (
    <div className="flex flex-col justify-between min-h-[320px] rounded-2xl border border-gray-800 bg-[#121214] p-6 shadow-md shadow-black/30 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40">
      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-1">
          {course.title}
        </h2>
        <p className="text-sm text-gray-400 mb-3">Level: {course.level}</p>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {course.description}
        </p>
      </div>

      {/* 버튼 영역 고정 */}
      <div className="mt-auto">
        {hasLink ? (
          <Link
            href={course.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2 font-semibold text-white transition hover:from-violet-700 hover:to-fuchsia-700"
          >
            Go To Course →
          </Link>
        ) : (
          <button
            disabled
            className="block text-center rounded-xl bg-gray-700 py-2 font-semibold text-gray-400 cursor-not-allowed w-full"
            title="링크가 제공되지 않았습니다."
          >
            No Link Available
          </button>
        )}
      </div>
    </div>
  )
}
