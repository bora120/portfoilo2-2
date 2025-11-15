// src/components/StudyLogList.tsx
import Link from 'next/link'
import DeleteLogButton from './StudyLogDeleteButton'

interface StudyLog {
  id: string
  title: string
  content: string
  createdAt?: string | Date
  courseId?: string
}

interface StudyLogListProps {
  logs: StudyLog[]
}

export default function StudyLogList({ logs }: StudyLogListProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-black/40 px-4 py-6 text-sm text-gray-500">
        아직 등록된 학습 기록이 없습니다. 아래에서 첫 기록을 남겨보세요.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const dateText = log.createdAt
          ? new Date(log.createdAt).toLocaleString('ko-KR')
          : ''

        return (
          <article
            key={log.id}
            className="relative rounded-2xl border border-gray-800 bg-black/40 px-4 py-3"
          >
            {/* 우측 상단 수정 / 삭제 */}
            <div className="absolute top-3 right-3 flex gap-2 text-[10px]">
              {log.courseId && (
                <Link
                  href={`/courses/${log.courseId}/logs/${log.id}/edit`}
                  className="rounded-md px-2 py-1 border border-gray-700 text-gray-300 hover:bg-gray-800/60 transition"
                >
                  수정
                </Link>
              )}
              <DeleteLogButton id={log.id} />
            </div>

            <h3 className="text-sm font-semibold text-gray-100 pr-16 line-clamp-1">
              {log.title}
            </h3>

            {dateText && (
              <p className="text-[10px] text-gray-500 mb-1">{dateText}</p>
            )}

            <p className="text-xs text-gray-400 whitespace-pre-wrap">
              {log.content}
            </p>
          </article>
        )
      })}
    </div>
  )
}
