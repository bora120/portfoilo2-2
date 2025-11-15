// src/libs/github.ts

// 대시보드 / 메인 / Repos 페이지에서 공통으로 사용할 GitHub 유틸들

export const GH_USERNAME =
  process.env.NEXT_PUBLIC_GITHUB_USERNAME ||
  process.env.GITHUB_USERNAME ||
  'bora120'

export type GhRepo = {
  id: number
  name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  html_url: string
  language: string | null
  pushed_at: string | null
  updated_at: string | null
  created_at?: string | null
}

export type GhEvent = {
  type: string
  created_at: string
}

/** GitHub 공통 헤더 (토큰 있으면 Authorization 포함) */
export function ghHeaders(): Record<string, string> {
  const token = process.env.GITHUB_ACCESS_TOKEN
  return token
    ? { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' }
    : { Accept: 'application/vnd.github+json' }
}

/** Response → JSON 변환을 안전하게 */
export async function safeJson<T>(res: Response | null): Promise<T | null> {
  try {
    if (!res || !res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/** GitHub 레포 리스트 가져오기 (Repos 페이지와 동일 기준) */
export async function fetchGithubRepos(perPage = 30): Promise<GhRepo[]> {
  if (!GH_USERNAME) return []

  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(
      GH_USERNAME
    )}/repos?per_page=${perPage}&sort=updated`,
    {
      headers: ghHeaders(),
      next: { revalidate: 3600 },
    }
  )

  return (await safeJson<GhRepo[]>(res)) ?? []
}

/** GitHub 공개 이벤트 (Push 이벤트 분석용) */
export async function fetchGithubEvents(perPage = 60): Promise<GhEvent[]> {
  if (!GH_USERNAME) return []

  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(
      GH_USERNAME
    )}/events/public?per_page=${perPage}`,
    {
      headers: ghHeaders(),
      next: { revalidate: 3600 },
    }
  )

  return (await safeJson<GhEvent[]>(res)) ?? []
}

/** 최근 8일 Push 이벤트 수를 일자별로 계산 (메인/대시보드 공통 로직) */
export function build8DaySparkline(events: GhEvent[]): number[] {
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
