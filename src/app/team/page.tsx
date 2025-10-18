'use client'

import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export default function TeamPage() {
  const { isSignedIn, user, isLoaded } = useUser()

  // 로딩 처리
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0c] text-gray-100">
        Loading...
      </div>
    )
  }

  // 로그인 필요 시 안내
  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-[#0b0b0c] flex flex-col items-center justify-center text-gray-100">
        <h1 className="text-2xl font-bold mb-4">Team Page</h1>
        <p className="mb-6 text-gray-400">이 페이지를 보려면 로그인하세요.</p>
        <Link
          href="/sign-in"
          className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 font-semibold text-white hover:from-violet-700 hover:to-fuchsia-700 transition"
        >
          Sign in
        </Link>
      </main>
    )
  }

  // ✅ 팀원 정보
  const teamMembers = [
    {
      id: 1,
      name: '김가연',
      role: '',
      bio: '추가 예정',
      image: '/team/kayun.png',
      github: 'https://github.com/bora120',
      email: 'kayunkim0120@gmail.com',
      portfolio: 'https://bora120.github.io/portfolio',
    },
    {
      id: 2,
      name: '최수민',
      role: '',
      bio: '추가 예정',
      image: '/team/sumin.png',
      github: 'https://github.com/',
      email: 'sumin@example.com',
      portfolio: 'https://example.com/sumin',
    },
    {
      id: 3,
      name: '천서연',
      role: '',
      bio: '추가 예정',
      image: '/team/seoyeon.png',
      github: 'https://github.com/',
      email: 'seoyeon@example.com',
      portfolio: 'https://example.com/seoyeon',
    },
    {
      id: 4,
      name: '조은수',
      role: '',
      bio: '추가 예정',
      image: '/team/eunsu.png',
      github: 'https://github.com/',
      email: 'eunsu@example.com',
      portfolio: 'https://example.com/eunsu',
    },
  ]

  // ✅ 팀 프로젝트 정보
  const teamProject = {
    title: 'Clerk App Project',
    description:
      'Clerk 인증을 이용한 포트폴리오 관리 웹앱. 로그인, 학습 내역, 대시보드, 팀 페이지 등으로 구성된 협업 프로젝트입니다.',
    link: 'https://github.com/bora120/clerk-app',
    image: '/team/project-preview.png',
  }

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-gray-100">
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-14">
        {/* ───── 헤더 ───── */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-2">Our Team</h1>
          <p className="text-gray-400">
            {user?.firstName}님, 아래는 프로젝트를 함께한 팀원들이에요.
          </p>
        </header>

        {/* ───── 팀원 카드 리스트 ───── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group relative rounded-2xl border border-gray-800 bg-[#121214] p-6 shadow-lg shadow-black/30 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
            >
              {/* 프로필 이미지 */}
              <div className="w-full h-40 mb-4 overflow-hidden rounded-xl bg-gray-900 flex items-center justify-center">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* 이름 + 역할 + 설명 */}
              <h2 className="text-xl font-semibold mb-1 text-gray-100 group-hover:text-white">
                {member.name}
              </h2>
              {member.role && (
                <p className="text-sm text-violet-400 mb-2">{member.role}</p>
              )}
              <p className="text-sm text-gray-400 mb-4 line-clamp-3 break-words">
                {member.bio}
              </p>

              {/* 연락처 + GitHub */}
              <div className="flex items-center gap-3 mb-4 text-sm">
                <Link
                  href={member.github}
                  target="_blank"
                  className="text-gray-300 hover:text-violet-400 transition-all"
                >
                  GitHub
                </Link>
                <span className="text-gray-600">•</span>
                <a
                  href={`mailto:${member.email}`}
                  className="text-gray-300 hover:text-violet-400 transition-all break-all"
                >
                  {member.email}
                </a>
              </div>

              {/* 개인 포트폴리오 버튼 */}
              <Link
                href={member.portfolio}
                target="_blank"
                className="block w-full text-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2 text-white font-semibold hover:from-violet-700 hover:to-fuchsia-700 transition"
              >
                개인 포트폴리오 보기 →
              </Link>

              {/* hover 효과 */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 transition group-hover:ring-1 group-hover:ring-violet-500/30" />
            </div>
          ))}
        </div>

        {/* ───── 팀 프로젝트 섹션 ───── */}
        <section className="rounded-2xl border border-gray-800 bg-[#121214] p-8 shadow-lg shadow-black/30">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">팀 프로젝트</h2>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* 프로젝트 이미지 */}
            <div className="w-full lg:w-1/3 rounded-xl overflow-hidden bg-gray-900">
              <Image
                src={teamProject.image}
                alt={teamProject.title}
                width={600}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>

            {/* 프로젝트 설명 */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                {teamProject.title}
              </h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                {teamProject.description}
              </p>
              <Link
                href={teamProject.link}
                target="_blank"
                className="inline-block rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-white font-semibold hover:from-violet-700 hover:to-fuchsia-700 transition"
              >
                팀 프로젝트 보기 →
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
