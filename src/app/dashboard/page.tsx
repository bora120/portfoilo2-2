// src/app/dashboard/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const { isAuthenticated } = await auth()

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0b0b0c] text-gray-100">
        <section className="mx-auto max-w-4xl px-6 pt-24 pb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-gray-400 mb-6">이 페이지를 보려면 로그인하세요.</p>
          <Link
            href="/sign-in"
            className="inline-block rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 font-semibold text-white transition-colors hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
          >
            Sign in
          </Link>
        </section>
      </main>
    )
  }

  const user = await currentUser()

  const displayName =
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    '사용자'

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    '-'

  const createdAt = formatKoreanDate(user?.createdAt)

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-gray-100">
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-14">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {/* 긴 이름 대비 줄바꿈 허용 */}
          <p className="text-gray-400 mt-2 break-words">{`Welcome, ${displayName}.`}</p>
        </header>

        {/* 사용자 정보 */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoItem label="이름" value={displayName} />
            {/* ✅ 긴 이메일이 박스를 넘지 않도록 처리 */}
            <InfoItem label="Email" value={email} />
            <InfoItem label="가입일" value={createdAt} />
          </div>
        </Card>

        {/* 요약 통계 */}
        <section aria-labelledby="summary" className="mb-8">
          <h2 id="summary" className="sr-only">
            Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="프로젝트 수"
              value="—"
              note="Repos 페이지 연동 예정"
            />
            <StatCard title="학습 기록" value="—" note="Courses 데이터 기준" />
            <StatCard
              title="최근 커밋"
              value="—"
              note="(선택) GitHub API 연동"
            />
          </div>
        </section>

        {/* 최근 활동 & 메모 */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">최근 활동</h3>
            <ul className="space-y-3 text-gray-300">
              {/* 긴 텍스트 대비 */}
              <li className="rounded-lg border border-gray-800 bg-[#141416] p-4 break-words">
                최근 활동이 여기에 표시됩니다. (연동 전 기본 안내)
              </li>
              <li className="rounded-lg border border-gray-800 bg-[#141416] p-4 break-words">
                예) 새 학습 기록 추가, 레포 업데이트 등
              </li>
            </ul>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">메모</h3>
            <p className="text-gray-300 break-words">
              해야 할 일/목표 등을 간단히 적어둘 수 있는 영역입니다.
            </p>
          </Card>
        </section>
      </section>
    </main>
  )
}

/* ───────────── UI Helpers ───────────── */

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-800 bg-[#121214] p-6 shadow-lg shadow-black/30 ${className}`}
    >
      {children}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#141416] p-4">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      {/* ✅ 핵심 수정: 긴 문자열(이메일/URL 등)도 카드 안에서 자동 줄바꿈 */}
      <div
        className="text-base text-gray-200 break-all leading-relaxed min-w-0"
        title={value}
      >
        {value}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  note,
}: {
  title: string
  value: string
  note?: string
}) {
  return (
    <Card>
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-100">{value}</div>
      {note && (
        <div className="mt-2 text-xs text-gray-500 break-words">{note}</div>
      )}
    </Card>
  )
}

/* ───────────── Utils ───────────── */

function formatKoreanDate(value: unknown): string {
  try {
    // ✅ value가 문자열이나 숫자일 때만 Date 생성
    if (typeof value !== 'string' && typeof value !== 'number') return '-'

    const d = new Date(value)
    if (isNaN(d.getTime())) return '-'

    return new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d)
  } catch {
    return '-'
  }
}
