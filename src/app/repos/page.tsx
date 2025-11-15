// src/app/repos/page.tsx

import Link from 'next/link'
import { FaCodeBranch, FaEye, FaStar } from 'react-icons/fa'

const username = 'bora120'
export const revalidate = 60

// GitHub에서 받아오는 레포 타입 (이 파일 안에서 독립적으로 정의)
type GitHubRepo = {
  id: number
  name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  html_url: string
  language: string | null
  pushed_at: string
  updated_at: string
}

// 메인 페이지와 동일한 날짜 포맷 유틸
function formatDate(input?: string | number | Date | null) {
  if (!input) return '—'
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

// 메인 페이지에서 쓰던 언어 색상 매핑
function langColor(lang: string | null | undefined): string {
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

export default async function ReposPage() {
  const token = process.env.GITHUB_ACCESS_TOKEN
  const url = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`

  const headers: Record<string, string> = token
    ? { Authorization: `token ${token}` }
    : {}

  try {
    const res = await fetch(url, { headers, next: { revalidate } })
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)

    const repos = (await res.json()) as GitHubRepo[]

    // 스타 → 포크 순으로 정렬
    repos.sort((a, b) => {
      const aTime = new Date(a.pushed_at || a.updated_at).getTime()
      const bTime = new Date(b.pushed_at || b.updated_at).getTime()
      return bTime - aTime
    })

    return (
      <main className="min-h-screen bg-transparent text-gray-100">
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-16">
          {/* 상단 인트로 */}
          <header className="space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1 text-[11px] text-pink-200">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
              Projects · GitHub Repositories
            </div>

            <div>
              <h1 className="section-title text-2xl sm:text-3xl font-semibold text-white">
                Projects
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-400">
                GitHub 계정{' '}
                <span className="text-pink-300 font-mono">@{username}</span>의
                공개 리포지토리를 모아, 스타/포크 기준으로 정렬한 프로젝트
                리스트입니다.
              </p>
            </div>
          </header>

          {/* 레포 리스트 카드 (메인 GitHub Activity와 동일 톤) */}
          <div className="card-min p-4">
            {repos.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                표시할 리포지토리가 없습니다.
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.map((repo) => (
                  <li key={repo.id}>
                    <RepoCard repo={repo} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    )
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'

    return (
      <main className="min-h-screen bg-transparent text-gray-100 flex items-center justify-center px-6">
        <div className="card-min max-w-md w-full p-6 text-center">
          <p className="text-gray-300 text-sm mb-2">
            ⚠️ GitHub 데이터를 불러오지 못했습니다.
          </p>
          <p className="text-xs text-gray-500 break-all">{message}</p>
        </div>
      </main>
    )
  }
}

// 메인 페이지 RepoRow 스타일을 확장한 프로젝트 카드
function RepoCard({ repo }: { repo: GitHubRepo }) {
  const langStyle = repo.language
    ? { backgroundColor: langColor(repo.language) }
    : undefined

  const updatedAt = repo.pushed_at ?? repo.updated_at

  return (
    <div className="repo-row">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* 이름 */}
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

          {/* 설명 */}
          <p className="mt-1 text-sm text-gray-400 line-clamp-2">
            {repo.description || '설명이 없습니다.'}
          </p>

          {/* 메타 정보 (스타 / 포크 / 워처 / 업데이트 시각 / 언어) */}
          <div className="mt-2 flex flex-wrap items-center gap-3 repo-meta">
            <span className="inline-flex items-center gap-1">
              <FaStar className="text-yellow-300/90" aria-hidden />
              {repo.stargazers_count ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <FaCodeBranch className="text-pink-300/90" aria-hidden />
              {repo.forks_count ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <FaEye className="text-blue-300/90" aria-hidden />
              {repo.watchers_count ?? 0}
            </span>
            <span>{formatDate(updatedAt)}</span>

            {repo.language && (
              <span className="inline-flex items-center gap-2">
                <span className="lang-dot" style={langStyle} />
                <span>{repo.language}</span>
              </span>
            )}
          </div>
        </div>

        {/* 오른쪽 액션 버튼들 (GitHub / 상세 페이지) */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-btn text-xs"
          >
            GitHub →
          </a>
          <Link
            href={`/repos/${encodeURIComponent(repo.name)}`}
            className="text-[11px] text-gray-500 hover:text-pink-300 transition"
          >
            상세 보기
          </Link>
        </div>
      </div>
    </div>
  )
}
