import Link from 'next/link'
import { FaCodeBranch, FaEye, FaStar } from 'react-icons/fa'
import type { Repository } from '@/types/repo'

const username = 'bora120'
export const revalidate = 60

export default async function ReposPage() {
  const token = process.env.GITHUB_ACCESS_TOKEN
  const url = `https://api.github.com/users/${username}/repos?per_page=30&sort=updated`
  const headers: HeadersInit = token ? { Authorization: `token ${token}` } : {}

  try {
    const res = await fetch(url, { headers, next: { revalidate } })
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
    const repos: Repository[] = await res.json()

    repos.sort(
      (a, b) =>
        (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0) ||
        (b.forks_count ?? 0) - (a.forks_count ?? 0)
    )

    return (
      <main className="min-h-screen bg-[#0b0b0c] text-gray-100">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-10">
          <h2 className="text-3xl font-bold mb-8">Repositories</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </ul>
        </section>
      </main>
    )
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'

    return (
      <main className="min-h-screen bg-[#0b0b0c] text-gray-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">
          ⚠️ 데이터를 불러오지 못했습니다. {message}
        </p>
      </main>
    )
  }
}

function RepoCard({ repo }: { repo: Repository }) {
  return (
    <Link
      href={`/repos/${repo.name}`}
      className="block rounded-2xl border border-gray-800 bg-[#121214] p-5 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 hover:border-gray-700 transition"
    >
      <h3 className="text-lg font-semibold mb-1">{repo.name}</h3>
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        {repo.description || '설명이 없습니다.'}
      </p>
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
        <Stat icon={<FaStar />} value={repo.stargazers_count} />
        <Stat icon={<FaCodeBranch />} value={repo.forks_count} />
        <Stat icon={<FaEye />} value={repo.watchers_count} />
      </div>
    </Link>
  )
}

function Stat({ icon, value }: { icon: React.ReactNode; value?: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-gray-800 bg-[#141416] px-3 py-1">
      <i aria-hidden>{icon}</i>
      {Intl.NumberFormat('en-US', { notation: 'compact' }).format(value ?? 0)}
    </span>
  )
}
