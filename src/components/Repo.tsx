// src/components/Repo.tsx

import Link from 'next/link'
import { FaStar, FaCodeBranch, FaEye } from 'react-icons/fa'

interface RepoProps {
  name: string
}

type GitHubRepo = {
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  html_url: string
  language: string | null
  pushed_at: string
  updated_at: string
  open_issues_count: number
  visibility: string
}

const username = 'bora120'
export const revalidate = 60

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

export default async function Repo({ name }: RepoProps) {
  const token = process.env.GITHUB_ACCESS_TOKEN
  const url = `https://api.github.com/repos/${username}/${encodeURIComponent(
    name
  )}`

  // 1차: 토큰 있으면 토큰 붙여서 요청
  const headers: Record<string, string> = token
    ? { Authorization: `token ${token}` }
    : {}

  let response = await fetch(url, {
    headers,
    next: { revalidate },
  })

  if (response.status === 401 && token) {
    response = await fetch(url, { next: { revalidate } })
  }

  if (!response.ok) {
    return (
      <div className="card-min p-6 mb-6 text-sm text-gray-300">
        리포지토리 정보를 불러오지 못했습니다. (status {response.status})
      </div>
    )
  }

  const repo = (await response.json()) as GitHubRepo

  return (
    <div className="card-min p-6 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-1">
            <Link
              href={`https://github.com/${username}/${name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-300 transition"
            >
              {repo.name}
            </Link>
          </h3>
          <p className="text-sm text-gray-400 mb-2">
            {repo.description || '설명이 없습니다.'}
          </p>
          <p className="text-[11px] text-gray-500">
            {repo.full_name} · {repo.visibility}
          </p>
        </div>
        <Link
          href={`https://github.com/${username}/${name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="link-btn text-xs"
        >
          GitHub →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-300">
        <div>
          <div className="text-gray-400 text-xs mb-1">Stars</div>
          <div className="inline-flex items-center gap-1">
            <FaStar className="text-yellow-300/90" />
            {repo.stargazers_count ?? 0}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs mb-1">Forks</div>
          <div className="inline-flex items-center gap-1">
            <FaCodeBranch className="text-pink-300/90" />
            {repo.forks_count ?? 0}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs mb-1">Watchers</div>
          <div className="inline-flex items-center gap-1">
            <FaEye className="text-blue-300/90" />
            {repo.watchers_count ?? 0}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs mb-1">Open Issues</div>
          <div>{repo.open_issues_count ?? 0}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <span>Last pushed: {formatDate(repo.pushed_at)}</span>
        <span>Updated: {formatDate(repo.updated_at)}</span>
        {repo.language && (
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            {repo.language}
          </span>
        )}
      </div>
    </div>
  )
}
