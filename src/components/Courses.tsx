// src/components/Courses.tsx
import Link from 'next/link'
import type { Course } from '@/types/course'
import CourseCompleteToggle from '@/components/CourseCompleteToggle'

interface CoursesProps {
  courses: Course[]
}

export default function Courses({ courses }: CoursesProps) {
  if (!Array.isArray(courses) || courses.length === 0) return null

  // 완료된 강의는 아래로 정렬
  const sortedCourses = [...courses].sort((a, b) => {
    const ac = (a as { completed?: boolean }).completed ?? false
    const bc = (b as { completed?: boolean }).completed ?? false
    return ac === bc ? 0 : ac ? 1 : -1
  })

  return (
    <div
      aria-label="Courses list"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {sortedCourses.map((course) => {
        const id = ((course as { id?: string; _id?: string }).id ??
          (course as { id?: string; _id?: string })._id ??
          '') as string

        return <CourseCard key={id} course={course} />
      })}
    </div>
  )
}

/* ───────────── 개별 강의 카드 ───────────── */
function CourseCard({ course }: { course: Course }) {
  const rawLink = typeof course.link === 'string' ? course.link.trim() : ''
  const hasLink = rawLink.length > 0 && /^(https?:)?\/\//.test(rawLink)

  const completed =
    typeof (course as { completed?: boolean }).completed === 'boolean'
      ? ((course as { completed?: boolean }).completed as boolean)
      : false

  const id = ((course as { id?: string; _id?: string }).id ??
    (course as { id?: string; _id?: string })._id ??
    '') as string

  return (
    <article
      className={`card-min flex flex-col justify-between min-h-[260px] p-6 border transition-all ${
        completed
          ? 'border-pink-500/30 bg-black/60 opacity-80'
          : 'border-gray-800 bg-black/40'
      }`}
    >
      <div>
        {id ? (
          <Link href={`/courses/${id}`} className="block group">
            <h2
              className={`text-base sm:text-lg font-semibold mb-1 line-clamp-2 transition-colors ${
                completed
                  ? 'text-gray-400 group-hover:text-pink-200'
                  : 'text-gray-100 group-hover:text-pink-200'
              }`}
            >
              {course.title}
            </h2>
          </Link>
        ) : (
          <h2 className="text-base sm:text-lg font-semibold mb-1 line-clamp-2 text-gray-100">
            {course.title}
          </h2>
        )}

        {course.level && (
          <p className="text-[11px] text-pink-300 mb-2">
            Level · {course.level}
          </p>
        )}

        {course.description && (
          <p
            className={`text-xs sm:text-sm leading-relaxed line-clamp-4 ${
              completed ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            {course.description}
          </p>
        )}
      </div>

      {/* 하단 액션 영역 */}
      <div className="mt-4 pt-3 border-t border-gray-800 flex items-center gap-2 text-[11px]">
        <div className="flex-1">
          {hasLink ? (
            <Link
              href={rawLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-400 to-fuchsia-400 hover:from-rose-500 hover:to-fuchsia-500 transition-all shadow-md hover:shadow-lg"
            >
              강의 바로가기 →
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="w-full rounded-xl border border-gray-700 bg-black/20 py-2 text-xs text-gray-500 cursor-not-allowed"
              title="링크가 제공되지 않았습니다."
            >
              링크가 없습니다
            </button>
          )}
        </div>

        {id && <CourseCompleteToggle id={id} completed={completed} />}
      </div>
    </article>
  )
}
