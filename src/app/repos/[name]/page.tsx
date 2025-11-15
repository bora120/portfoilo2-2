// src/app/repos/[name]/page.tsx

import Link from 'next/link'
import { Suspense } from 'react'
import Repo from '@/components/Repo'
import RepoDirs from '@/components/RepoDirs'

// Next 15: params는 Promise 형태로 들어온다고 가정
type RouteParams = {
  name: string
}

export default async function RepoPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  // ❗ 여기서 반드시 await 해서 name만 꺼낸다
  const { name } = await params

  return (
    <main className="min-h-screen bg-transparent text-gray-100">
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-16">
        {/* 상단: 뒤로가기 */}
        <div className="mb-6">
          <Link
            href="/repos"
            className="text-sm text-gray-400 hover:text-pink-300 transition"
          >
            ← Back to Projects
          </Link>
        </div>

        {/* 리포지토리 정보 */}
        <Suspense
          fallback={
            <div className="card-min p-4 mb-4 text-sm text-gray-400">
              리포지토리 정보를 불러오는 중입니다...
            </div>
          }
        >
          {/* ❗ 더 이상 params.name 직접 쓰지 말고, 위에서 꺼낸 name 사용 */}
          <Repo name={name} />
        </Suspense>

        {/* 디렉터리 정보 */}
        <Suspense
          fallback={
            <div className="card-min p-4 mt-4 text-sm text-gray-400">
              디렉터리 정보를 불러오는 중입니다...
            </div>
          }
        >
          <RepoDirs name={name} />
        </Suspense>
      </section>
    </main>
  )
}
