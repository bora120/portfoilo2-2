// src/components/RepoDirs.tsx

import Link from 'next/link'
import { GitHubContent } from '@/types/github'

interface RepoProps {
  name: string
}

const username = 'bora120'
export const revalidate = 60

export default async function RepoDirs({ name }: RepoProps) {
  const token = process.env.GITHUB_ACCESS_TOKEN
  const url = `https://api.github.com/repos/${username}/${encodeURIComponent(
    name
  )}/contents`

  const headers: Record<string, string> = token
    ? { Authorization: `token ${token}` }
    : {}

  // 1차: 토큰이 있다면 토큰 포함해서 요청
  let response = await fetch(url, {
    headers,
    next: { revalidate },
  })

  // ❗ 토큰이 있는데 401 나오면 → 토큰 없이 다시 시도
  if (response.status === 401 && token) {
    response = await fetch(url, { next: { revalidate } })
  }

  // 여전히 실패면 메시지 출력
  if (!response.ok) {
    return (
      <div className="card-min mt-6 p-4 text-sm text-gray-400">
        디렉터리 정보를 불러오지 못했습니다. (status {response.status})
      </div>
    )
  }

  const data = (await response.json()) as unknown

  // GitHub가 배열이 아니고 객체를 줄 수도 있으니 방어 코드
  if (!Array.isArray(data)) {
    return null
  }

  const contents = data as GitHubContent[]
  const dirs = contents.filter((content) => content.type === 'dir')

  if (dirs.length === 0) {
    return null
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-3">Directories</h3>
      <ul className="space-y-2 text-sm text-gray-300">
        {dirs.map((dir) => (
          <li key={dir.path}>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-[#141416] px-3 py-1 hover:border-pink-500 transition"
              href={`https://github.com/${username}/${name}/tree/master/${dir.path}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
              {dir.path}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
