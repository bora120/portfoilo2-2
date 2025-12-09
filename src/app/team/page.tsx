'use client'

import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

type TeamMember = {
  id: number
  name: string
  role: string
  bio: string
  image: string
  github: string
  email: string
  portfolio: string
}

type TeamProject = {
  title: string
  description: string
  link: string
  image: string
}

/* ──────────────────────────────
   Static Data
   ────────────────────────────── */
const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: '김가연',
    role: 'Frontend · Security',
    bio: '포트폴리오 기획, Clerk 인증 연동, 대시보드 UI, GitHub Activity 섹션을 구현했습니다.',
    image: '/team/kayun.png',
    github: 'https://github.com/bora120',
    email: 'kayunkim0120@gmail.com',
    portfolio: 'https://portfoilo2-2.vercel.app',
  },
  {
    id: 2,
    name: '최수민',
    role: 'Backend · Data',
    bio: '데이터 구조 및 API 설계, 학습 내역 저장 로직과 서버 연동을 담당했습니다.',
    image: '/team/sumin.png',
    github: 'https://github.com/sumin8838',
    email: 'dudtladl0573@naver.com',
    portfolio: 'https://example.com/sumin',
  },
  {
    id: 3,
    name: '천서연',
    role: 'UI · Document',
    bio: '와이어프레임, 화면 흐름, 발표 자료 및 기술 문서를 정리했습니다.',
    image: '/team/seoyeon.png',
    github: 'https://github.com/westkiteS2',
    email: 'seoyeon8513@gmail.com',
    portfolio: 'https://webserver-portfolio-final-2025-2.vercel.app',
  },
  {
    id: 4,
    name: '조은수',
    role: 'QA · Research',
    bio: '테스트 케이스 작성, 버그 리포트, 레퍼런스 조사와 기능 개선 아이디어를 제안했습니다.',
    image: '/team/eunsu.png',
    github: 'https://github.com/myyonop',
    email: 'kreideprinz913@gmail.com ',
    portfolio: 'https://web-s-portfolio.vercel.app',
  },
]

const TEAM_PROJECT: TeamProject = {
  title: 'Clerk App Project',
  description:
    '독서리뷰플랫폼을 구현한 팀 프로젝트 입니다. 로그인을 할 때 2단계 보안 인증을 적용하고, 비밀번호 강도를 분석 기능을 넣었습니다.',
  link: 'http://xn--book-review-black-five-cq04g.vercel.app/',
  image: '/team/project-preview.png',
}

/* ──────────────────────────────
   Team Page
   ────────────────────────────── */
export default function TeamPage() {
  const { isSignedIn, user, isLoaded } = useUser()

  // 로딩
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-transparent text-gray-100 flex items-center justify-center px-6">
        <section className="card-min max-w-sm w-full px-6 py-4 text-center">
          <p className="text-sm text-gray-300">
            팀 정보를 불러오는 중입니다...
          </p>
        </section>
      </main>
    )
  }

  // 비로그인
  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-transparent text-gray-100 flex items-center justify-center px-6">
        <section className="card-min max-w-md w-full px-6 py-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-[11px] text-pink-200">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            Team · Members Only
          </div>
          <h1 className="section-title text-xl sm:text-2xl font-semibold text-white mb-0">
            Team Page
          </h1>
          <p className="text-sm text-gray-400">
            이 페이지는 로그인한 사용자만 볼 수 있습니다.
          </p>
          <Link href="/sign-in" className="btn-primary inline-block px-6">
            Sign in
          </Link>
        </section>
      </main>
    )
  }

  // 로그인 상태
  return (
    <main className="min-h-screen bg-transparent text-gray-100">
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-16">
        {/* 상단 헤더 - Projects 페이지와 동일하게 왼쪽 정렬 */}
        <header className="space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1 text-[11px] text-pink-200">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            Team · Collaboration
          </div>

          <div>
            <h1 className="section-title text-2xl sm:text-3xl font-semibold text-white">
              Our Team
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-400">
              {user?.firstName ?? '회원'}님, Clerk App 프로젝트를 함께한 팀원
              소개 페이지입니다.
            </p>
          </div>
        </header>

        {/* 팀원 카드 리스트 */}
        <section
          aria-label="프로젝트 팀원 소개"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {TEAM_MEMBERS.map((member) => (
            <article
              key={member.id}
              className="group card-min p-5 flex flex-col h-full relative overflow-hidden"
            >
              {/* 상단: 아바타 + 이름/역할 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-pink-500/40 to-purple-500/40 flex items-center justify-center overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={56}
                    height={56}
                    className="object-cover h-full w-full"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-gray-100 truncate">
                    {member.name}
                  </h2>
                  {member.role && (
                    <p className="text-[11px] text-pink-300 mt-0.5">
                      {member.role}
                    </p>
                  )}
                </div>
              </div>

              {/* 소개 */}
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-4 break-words">
                {member.bio}
              </p>

              {/* 하단: 연락처 + 포트폴리오 링크 (Projects 페이지 스타일과 맞춤) */}
              <div className="mt-auto pt-4 space-y-2 text-[11px] text-gray-300">
                <div className="flex items-center gap-3">
                  <Link
                    href={member.github}
                    target="_blank"
                    className="hover:text-pink-300 transition"
                  >
                    GitHub
                  </Link>
                  <span className="text-gray-600">•</span>
                  <a
                    href={`mailto:${member.email}`}
                    className="hover:text-pink-300 transition break-all"
                  >
                    {member.email}
                  </a>
                </div>

                <Link
                  href={member.portfolio}
                  target="_blank"
                  className="link-btn text-[11px] inline-flex items-center"
                >
                  개인 포트폴리오 보기 →
                </Link>
              </div>

              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 transition group-hover:ring-1 group-hover:ring-pink-500/30" />
            </article>
          ))}
        </section>

        {/* 팀 프로젝트 섹션 */}
        <section
          aria-label="팀 프로젝트"
          className="card-min p-8 flex flex-col gap-6 lg:flex-row lg:items-center"
        >
          {/* 프로젝트 이미지 */}
          <div className="w-full lg:w-1/3 rounded-xl overflow-hidden bg-gray-900">
            <Image
              src={TEAM_PROJECT.image}
              alt={TEAM_PROJECT.title}
              width={600}
              height={400}
              className="object-cover w-full h-full"
            />
          </div>

          {/* 프로젝트 설명 */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2 text-gray-100">
              팀 프로젝트
            </h2>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
              {TEAM_PROJECT.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-400 mb-4 leading-relaxed">
              {TEAM_PROJECT.description}
            </p>
            <Link
              href={TEAM_PROJECT.link}
              target="_blank"
              className="link-btn text-sm inline-flex"
            >
              팀 프로젝트 보기 →
            </Link>
          </div>
        </section>
      </section>
    </main>
  )
}
