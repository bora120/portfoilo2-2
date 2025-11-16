// src/app/page.tsx

import { auth, currentUser } from '@clerk/nextjs/server'
import ParallaxHero from '@/components/ParallaxHero'
import AboutConsole from '@/components/AboutConsole'

/* ────────────────────────────────────────────────────────────
   About: 데이터 (사용자 입력 영역)
   ──────────────────────────────────────────────────────────── */
const ABOUT = {
  phone: '010-9495-7736',
  instagram: '_7yxn',
  github: 'https://github.com/bora120',
  school: '중부대학교',
  major: '정보보호학과 2학년',
  learning: ['React', 'Next.js', 'TailwindCSS', 'Clerk'],
  tools: ['Git', 'Vercel', 'VSCode', 'Figma'],
  interests: ['Frontend Security', 'UI Performance'],
}

// About 콘솔에 항상 표시할 연락용 이메일 (로그인한 이메일과 분리)
const CONTACT_EMAIL = 'kimkayun0120@gamil.com'

/* ────────────────────────────────────────────────────────────
   Utils
   ──────────────────────────────────────────────────────────── */
function formatDate(input: string | number | Date) {
  try {
    const d = input instanceof Date ? input : new Date(input)
    if (Number.isNaN(d.getTime())) return '—'
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${hh}:${mm}`
  } catch {
    return '—'
  }
}

/* ────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────── */
type AppUser = Awaited<ReturnType<typeof currentUser>>
type SnapshotProps = {
  user: AppUser
  sessionId: string | null
}

/* ────────────────────────────────────────────────────────────
   Account Security Snapshot
   - Clerk 계정 보안 정보 요약
   ──────────────────────────────────────────────────────────── */
function SecuritySnapshot({ user, sessionId }: SnapshotProps) {
  const email = user?.primaryEmailAddress?.emailAddress ?? '—'
  const twoFA =
    typeof user?.twoFactorEnabled === 'boolean'
      ? user.twoFactorEnabled
        ? 'Enabled'
        : 'Disabled'
      : '—'
  const lastSignIn = user?.lastSignInAt
    ? formatDate(new Date(user.lastSignInAt))
    : '—'
  const session = sessionId ? 'Active' : '—'

  return (
    <section
      aria-labelledby="sec-snap"
      className="mx-auto max-w-5xl px-6 pt-12"
    >
      <h2
        id="sec-snap"
        className="section-title text-xl sm:text-2xl font-semibold mb-6 text-white"
      >
        Account Security Snapshot
      </h2>

      <div className="card-min p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-300 text-sm sm:text-base">
          <div>
            <dt className="text-gray-400 mb-1">Email</dt>
            <dd className="break-all">{email}</dd>
          </div>

          <div>
            <dt className="text-gray-400 mb-1">Two-Factor Auth</dt>
            <dd>
              <span
                className={
                  twoFA === 'Enabled'
                    ? 'badge badge-green'
                    : twoFA === 'Disabled'
                    ? 'badge badge-rose'
                    : 'badge badge-gray'
                }
              >
                <span className="badge-dot bg-current" />
                {twoFA}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-gray-400 mb-1">Last Sign-in</dt>
            <dd>{lastSignIn}</dd>
          </div>

          <div>
            <dt className="text-gray-400 mb-1">Session</dt>
            <dd>
              <span
                className={
                  session === 'Active'
                    ? 'badge badge-green'
                    : 'badge badge-gray'
                }
              >
                <span className="badge-dot bg-current" />
                {session}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────
   Login Activity Snapshot
   - 계정 생성일 / User ID / 세션 정보
   ──────────────────────────────────────────────────────────── */
function LoginActivitySnapshot({ user, sessionId }: SnapshotProps) {
  const createdAt = user?.createdAt ? formatDate(new Date(user.createdAt)) : '—'
  const userId = user?.id ?? '—'
  const sessionStatus = sessionId ? 'Active' : '—'
  const displaySessionId = sessionId ?? '—'

  return (
    <section
      aria-labelledby="login-activity-snap"
      className="mx-auto max-w-5xl px-6 pt-12 pb-16"
    >
      <h2
        id="login-activity-snap"
        className="section-title text-xl sm:text-2xl font-semibold mb-6 text-white"
      >
        Login Activity Snapshot
      </h2>

      <div className="card-min p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-300 text-sm sm:text-base">
          <div>
            <dt className="text-gray-400 mb-1">Account Created</dt>
            <dd>{createdAt}</dd>
          </div>

          <div>
            <dt className="text-gray-400 mb-1">User ID</dt>
            <dd className="break-all text-sm text-gray-300">{userId}</dd>
          </div>

          <div>
            <dt className="text-gray-400 mb-1">Session Status</dt>
            <dd>
              <span
                className={
                  sessionStatus === 'Active'
                    ? 'badge badge-green'
                    : 'badge badge-gray'
                }
              >
                <span className="badge-dot bg-current" />
                {sessionStatus}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-gray-400 mb-1">Current Session ID</dt>
            <dd className="truncate text-sm text-gray-400">
              {displaySessionId}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────
   Home
   ──────────────────────────────────────────────────────────── */

export default async function Home() {
  // auth / user 를 한 번만 가져와서 전체에서 재사용
  const [authData, user] = await Promise.all([auth(), currentUser()])
  const sessionId = authData.sessionId ?? null

  // About 섹션에 표시할 연락용 이메일은 고정 값 사용
  const email = CONTACT_EMAIL

  return (
    <main className="min-h-screen bg-transparent text-gray-100">
      {/* 3D Parallax Hero */}
      <ParallaxHero />

      {/* About: 콘솔 버전 */}
      <AboutConsole email={email} about={ABOUT} />

      {/* Clerk 실제 데이터 기반 스냅샷들 */}
      <SecuritySnapshot user={user} sessionId={sessionId} />
      <LoginActivitySnapshot user={user} sessionId={sessionId} />
    </main>
  )
}
