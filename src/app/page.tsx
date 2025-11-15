// src/app/page.tsx

import { auth, currentUser } from '@clerk/nextjs/server'
import ParallaxHero from '@/components/ParallaxHero'
import AboutConsole from '@/components/AboutConsole'

/* ────────────────────────────────────────────────────────────
   About: 데이터 (사용자 입력 영역)
   - 화면 출력 변경 없이 데이터만 주입
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

/* ────────────────────────────────────────────────────────────
   Utils: 공통 유틸 (formatDate / safeJson / ghHeaders)
   - 시각/출력 포맷은 기존과 동일
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

async function safeJson<T>(res: Response | null): Promise<T | null> {
  try {
    if (!res || !res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function ghHeaders(): Record<string, string> {
  const token = process.env.GITHUB_ACCESS_TOKEN
  return token
    ? { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' }
    : { Accept: 'application/vnd.github+json' }
}

/* ────────────────────────────────────────────────────────────
   Security Snapshot (서버 컴포넌트)
   - auth() & currentUser() 병렬화 (기능/출력 동일)
   ──────────────────────────────────────────────────────────── */
async function SecuritySnapshot() {
  // parallelize auth + currentUser
  const [authData, user] = await Promise.all([auth(), currentUser()])

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
  const session = authData.sessionId ? 'Active' : '—'

  return (
    <section
      aria-labelledby="sec-snap"
      className="mx-auto max-w-5xl px-6 pt-12"
    >
      <h2
        id="sec-snap"
        className="section-title text-2xl font-semibold mb-6 text-white"
      >
        Security Snapshot
      </h2>

      <div className="card-min p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-300">
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
   GitHub Activity (서버 컴포넌트)
   - fetch(events/repos) 병렬 (기존과 동일)
   - 시각/레이아웃은 그대로 유지
   ──────────────────────────────────────────────────────────── */
type GhRepo = {
  id: number
  name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  html_url: string
  pushed_at: string
  language: string | null
}
type GhEvent = { type: string; created_at: string }

const GH_USERNAME = 'bora120'

function build8DaySparkline(events: GhEvent[]) {
  const today = new Date()
  const startUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
  const buckets = Array<number>(8).fill(0)

  for (const ev of events ?? []) {
    if (ev?.type !== 'PushEvent' || !ev.created_at) continue
    const d = new Date(ev.created_at)
    if (Number.isNaN(d.getTime())) continue

    const diffDays =
      (startUTC - Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) /
      (24 * 60 * 60 * 1000)
    const idx = Math.floor(diffDays)
    if (idx >= 0 && idx < 8) buckets[7 - idx] += 1
  }
  return buckets
}

/* 언어 색상 (간단 매핑) */
function langColor(lang: string | null): string {
  const L = (lang || '').toLowerCase()
  switch (L) {
    case 'typescript':
      return '#3178c6'
    case 'javascript':
      return '#f1e05a'
    case 'python':
      return '#3572A5'
    case 'java':
      return '#b07219'
    case 'go':
      return '#00ADD8'
    case 'rust':
      return '#dea584'
    case 'c++':
      return '#f34b7d'
    case 'c':
      return '#555555'
    case 'php':
      return '#4F5D95'
    case 'kotlin':
      return '#A97BFF'
    case 'swift':
      return '#F05138'
    case 'ruby':
      return '#701516'
    default:
      return '#9ca3af'
  }
}

async function GithubActivity() {
  let events: GhEvent[] = []
  let repos: GhRepo[] = []

  try {
    // parallel fetch
    const [evRes, repoRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GH_USERNAME}/events/public`, {
        headers: ghHeaders(),
        next: { revalidate: 60 }, // 1분마다 새로고침 느낌
      }),
      fetch(
        `https://api.github.com/users/${GH_USERNAME}/repos?per_page=100&sort=updated`,
        {
          headers: ghHeaders(),
          next: { revalidate: 60 },
        }
      ),
    ])

    events = (await safeJson<GhEvent[]>(evRes)) ?? []
    repos = (await safeJson<GhRepo[]>(repoRes)) ?? []
  } catch {
    events = []
    repos = []
  }

  const spark = build8DaySparkline(events)
  const totalPush = spark.reduce((a, b) => a + b, 0)
  const top3 = [...repos]
    .sort((a, b) => {
      const aTime = new Date(a.pushed_at).getTime()
      const bTime = new Date(b.pushed_at).getTime()
      return bTime - aTime // 최신 push 순
    })
    .slice(0, 3)

  return (
    <section
      aria-labelledby="gh-activity"
      className="mx-auto max-w-5xl px-6 pt-12 pb-16"
    >
      <h2
        id="gh-activity"
        className="section-title text-2xl font-semibold mb-6 text-white"
      >
        GitHub Activity
      </h2>

      {/* Overview: Sparkline Panel */}
      <div className="card-min p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400 text-sm">최근 8일 Push 이벤트</p>
          <span className="text-xs text-gray-500">@{GH_USERNAME}</span>
        </div>
        <Sparkline values={spark} />
        <div className="mt-4 text-sm text-gray-400">
          Pushes:&nbsp;
          <span className="text-pink-300 font-semibold">{totalPush}</span>
        </div>
      </div>

      {/* Repos: 리스트형 (동일 디자인 톤) */}
      <div className="card-min p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.length > 0 ? (
            top3.map((r) => <RepoRow key={r.id} repo={r} />)
          ) : (
            <div className="col-span-full text-center text-gray-400 py-8">
              GitHub 데이터를 불러오지 못했습니다.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* Sparkline (minimal line + dots) */
function Sparkline({ values }: { values: number[] }) {
  const width = 360
  const height = 72
  const max = Math.max(1, ...values)
  const step = values.length > 1 ? width / (values.length - 1) : width

  const pts = values
    .map((v, i) => {
      const x = i * step
      const y = height - (v / max) * (height - 10) - 5
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-20"
      aria-label="8-day sparkline"
    >
      <line
        x1="0"
        y1={height - 1}
        x2={width}
        y2={height - 1}
        className="spark-min-base"
      />
      <polyline points={pts} className="spark-min-line" fill="none" />
      {values.map((v, i) => {
        const x = i * step
        const y = height - (v / max) * (height - 10) - 5
        return <circle key={i} cx={x} cy={y} className="spark-min-dot" />
      })}
    </svg>
  )
}

/* Repo Row (list item) */
function RepoRow({ repo }: { repo: GhRepo }) {
  const color = { backgroundColor: langColor(repo.language) }
  return (
    <div className="repo-row">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-name truncate"
              title={repo.name}
            >
              {repo.name}
            </a>
          </div>

          <p className="mt-1 text-sm text-gray-400 line-clamp-2">
            {repo.description ?? 'No description'}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 repo-meta">
            <span>⭐ {repo.stargazers_count}</span>
            <span>🍴 {repo.forks_count}</span>
            <span>{formatDate(repo.pushed_at)}</span>
            {repo.language && (
              <span className="inline-flex items-center gap-2">
                <span className="lang-dot" style={color} />
                <span>{repo.language}</span>
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-btn"
          >
            GitHub →
          </a>
        </div>
      </div>
    </div>
  )
}

export default async function Home() {
  // user email (for AboutConsole). SecuritySnapshot은 내부에서 별도 병렬 처리함.
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? null

  return (
    <main className="min-h-screen bg-transparent text-gray-100">
      {/* 3D Parallax Hero */}
      <ParallaxHero />

      {/* About: 콘솔 버전 */}
      <AboutConsole email={email} about={ABOUT} />

      {/* 통일된 미니멀 카드 톤으로 스냅샷 + 깃허브 */}
      <SecuritySnapshot />
      <GithubActivity />
    </main>
  )
}
