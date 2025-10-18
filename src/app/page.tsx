import { auth, currentUser } from '@clerk/nextjs/server'
import ParallaxHero from '@/components/ParallaxHero'

/* ───────────── Utils ───────────── */
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

/* ───────────── 🔐 Security Snapshot ───────────── */
async function SecuritySnapshot() {
  const { sessionId } = await auth()
  const user = await currentUser()

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
    <section aria-labelledby="sec-snap" className="mx-auto max-w-5xl px-6 pt-8">
      <h2 id="sec-snap" className="text-2xl font-semibold mb-4">
        Security Snapshot
      </h2>
      <div className="rounded-2xl border border-gray-800 bg-[#121214]/90 backdrop-blur-sm p-6 shadow-lg shadow-black/30">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
          <div>
            <dt className="text-gray-400">Email</dt>
            <dd className="break-all">{email}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Two-Factor Auth</dt>
            <dd>{twoFA}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Last Sign-in</dt>
            <dd>{lastSignIn}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Session</dt>
            <dd>{session}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

/* ───────────── 📊 GitHub Activity ───────────── */
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
    if (!ev || ev.type !== 'PushEvent' || !ev.created_at) continue
    const d = new Date(ev.created_at)
    if (Number.isNaN(d.getTime())) continue
    const diffDays = Math.floor(
      (startUTC - Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) /
        (24 * 60 * 60 * 1000)
    )
    if (diffDays >= 0 && diffDays < 8) buckets[7 - diffDays] += 1
  }
  return buckets
}

async function GithubActivity() {
  let events: GhEvent[] = []
  let repos: GhRepo[] = []
  try {
    const [evRes, repoRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GH_USERNAME}/events/public`, {
        headers: ghHeaders(),
        next: { revalidate: 3600 },
      }),
      fetch(
        `https://api.github.com/users/${GH_USERNAME}/repos?per_page=100&sort=updated`,
        {
          headers: ghHeaders(),
          next: { revalidate: 3600 },
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
  const top3 = [...repos]
    .filter((r) => r && typeof r.stargazers_count === 'number')
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 3)

  return (
    <section
      aria-labelledby="gh-activity"
      className="mx-auto max-w-5xl px-6 pt-10 pb-12"
    >
      <h2 id="gh-activity" className="text-2xl font-semibold mb-4">
        GitHub Activity
      </h2>

      {/* 스파크라인 카드 */}
      <div className="rounded-2xl border border-gray-800 bg-[#121214]/90 backdrop-blur-sm p-6 shadow-lg shadow-black/30 mb-6">
        <div className="flex items-end justify-between mb-3">
          <p className="text-gray-400 text-sm">최근 8일 Push 이벤트</p>
          <span className="text-xs text-gray-500">@{GH_USERNAME}</span>
        </div>
        <Sparkline values={spark} />
      </div>

      {/* 상위 3개 레포 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top3.length > 0 ? (
          top3.map((r) => <RepoCard key={r.id} repo={r} />)
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-800 bg-[#121214]/90 backdrop-blur-sm p-8 text-center text-gray-400">
            GitHub 데이터를 불러오지 못했습니다.
          </div>
        )}
      </div>
    </section>
  )
}

function Sparkline({ values }: { values: number[] }) {
  const width = 320,
    height = 64
  const max = Math.max(1, ...values)
  const step = width / (values.length - 1)
  const points = values
    .map((v, i) => {
      const x = i * step
      const y = height - (v / max) * (height - 8) - 4
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-16"
      aria-label="8-day activity sparkline"
    >
      <line
        x1="0"
        y1={height - 1}
        x2={width}
        y2={height - 1}
        stroke="rgba(255,255,255,0.08)"
      />
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill="rgba(244,114,182,0.15)"
      />
      <polyline
        points={points}
        fill="none"
        stroke="rgba(244,114,182,0.85)"
        strokeWidth="2"
      />
      {values.map((v, i) => {
        const x = i * step
        const y = height - (v / max) * (height - 8) - 4
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2.5"
            fill="white"
            fillOpacity="0.9"
          />
        )
      })}
    </svg>
  )
}

function RepoCard({ repo }: { repo: GhRepo }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-800 bg-[#121214]/90 backdrop-blur-sm p-6 shadow-lg shadow-black/30">
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-1 break-words">
          {repo.name}
        </h3>
        <p className="text-sm text-gray-400 mb-4 break-words max-h-14 overflow-hidden">
          {repo.description ?? 'No description'}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>⭐ {repo.stargazers_count}</span>
        <span>🍴 {repo.forks_count}</span>
        <span>🕒 {formatDate(repo.pushed_at)}</span>
      </div>
      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block w-full text-center rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 py-2 font-semibold text-white hover:from-pink-700 hover:to-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 transition"
      >
        View on GitHub →
      </a>
    </div>
  )
}

/* ───────────── Page ───────────── */
export default async function Home() {
  return (
    <main className="min-h-screen bg-transparent text-gray-100">
      {/* 3D Parallax Hero */}
      <ParallaxHero />

      {/* 보안 + 깃허브 */}
      <SecuritySnapshot />
      <GithubActivity />
    </main>
  )
}
