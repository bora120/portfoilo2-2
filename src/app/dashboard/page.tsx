// src/app/dashboard/page.tsx

import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import connectMongoDB from '@/libs/mongodb'
import Course from '@/models/course'
import StudyLog from '@/models/studyLog'
import {
  getMemosByUserId,
  createDashboardMemo,
  updateDashboardMemo,
  deleteDashboardMemo,
} from '@/actions/dashboardMemoActions'

type ActivityType = 'learning' | 'github'

interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description?: string
  date: Date
  link?: string
}

interface LearningStats {
  totalCourses: number
  completedCourses: number
  totalLogs: number
  lastStudyLogAt: Date | null
}

interface SimpleRepo {
  id: string
  name: string
  description: string
  url: string
  updatedAt: Date
}

interface GithubData {
  projectsCount: number
  recentCommitCount: number
  activities: ActivityItem[]
  recentRepos: SimpleRepo[]
}

interface DashboardMemo {
  id: string
  title: string
  content?: string
  createdAt: Date
  isDone?: boolean
}

interface DashboardData {
  learningStats: LearningStats
  projectsCount: number
  recentCommitCount: number
  learningActivities: ActivityItem[]
  githubActivities: ActivityItem[]
  memos: DashboardMemo[]
}

/* ───────────── GitHub 관련 타입 & 상수 ───────────── */

type GhRepo = {
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

type GhEvent = {
  type: string
  created_at: string
}

const GITHUB_USERNAME = 'bora120' // Repos 페이지와 동일 기준

/* ───────────── MongoDB Lean 도큐먼트 타입 ───────────── */

type CourseDoc = {
  completed?: boolean
}

type StudyLogDoc = {
  _id: { toString(): string }
  title: string
  content?: string
  createdAt?: Date
  courseId?: { toString(): string } | string
}

type DashboardMemoDoc = {
  _id: { toString(): string }
  title: string
  content?: string
  isDone?: boolean
  createdAt?: Date
}

export default async function DashboardPage() {
  const { userId } = await auth()

  // ───────── 비로그인 상태 ─────────
  if (!userId) {
    return (
      <main className="min-h-screen bg-transparent text-gray-100">
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-16">
          <section className="card-min px-6 py-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-[11px] text-pink-200">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
              Dashboard · Members Only
            </div>
            <h1 className="section-title text-xl sm:text-2xl font-semibold text-white mb-0">
              Dashboard
            </h1>
            <p className="text-sm text-gray-400">
              이 페이지는 로그인한 사용자만 볼 수 있습니다.
            </p>
            <Link href="/sign-in" className="btn-primary inline-block px-6">
              Sign in
            </Link>
          </section>
        </section>
      </main>
    )
  }

  // ───────── 로그인 상태 ─────────
  const user = await currentUser()

  const displayName =
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    '사용자'

  // 대시보드용 데이터 로딩 (학습 + GitHub + 메모)
  const {
    learningStats,
    projectsCount,
    recentCommitCount,
    learningActivities,
    githubActivities,
    memos,
  } = await getDashboardData(userId)

  const learningNote =
    learningStats.totalCourses > 0
      ? `${learningStats.completedCourses}/${learningStats.totalCourses} 강의 완료`
      : '등록된 학습 기록 수 기준'

  // 메모 작성용 서버 액션
  const createMemoAction = async (formData: FormData) => {
    'use server'

    const title = (formData.get('title') as string | null)?.trim() ?? ''
    const content = (formData.get('content') as string | null)?.trim() ?? ''

    if (!title && !content) {
      redirect('/dashboard')
    }

    await createDashboardMemo({
      userId,
      title,
      content,
    })

    redirect('/dashboard')
  }

  // 메모 수정 서버 액션
  const updateMemoAction = async (formData: FormData) => {
    'use server'

    const id = (formData.get('id') as string | null)?.trim()
    const title = (formData.get('title') as string | null)?.trim() ?? ''
    const content = (formData.get('content') as string | null)?.trim() ?? ''

    if (!id) {
      redirect('/dashboard')
    }

    await updateDashboardMemo({
      id,
      userId,
      title,
      content,
    })

    redirect('/dashboard')
  }

  // 메모 삭제 서버 액션
  const deleteMemoAction = async (formData: FormData) => {
    'use server'

    const id = (formData.get('id') as string | null)?.trim()

    if (!id) {
      redirect('/dashboard')
    }

    await deleteDashboardMemo(id, userId)

    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-transparent text-gray-100">
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-16">
        {/* 헤더 */}
        <header className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1 text-[11px] text-pink-200">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            Dashboard · Overview
          </div>

          <div>
            <h1 className="section-title text-2xl sm:text-3xl font-semibold text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-400 break-words">
              {`Welcome, ${displayName}.`} 학습 기록과 GitHub 활동을 한눈에
              정리한 페이지입니다.
            </p>
          </div>
        </header>

        {/* 대시보드 메모 카드 (기존 GitHub 최근 수정 프로젝트 카드 위치) */}
        <section className="mb-8">
          <Card>
            <header className="mb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                  {/* 제목: 연한 핑크 */}
                  <h2 className="text-sm font-semibold text-white">메모장</h2>
                  {/* 설명: 조금 더 연한 핑크 */}
                  <p className="text-[11px] text-gray-500">
                    오늘의 할 일을 메모하고 기록하세요.
                  </p>
                </div>
                {/* 오른쪽 라벨: 최근 활동 섹션 Activity Log와 동일 톤 */}
                <span className="text-[11px] text-pink-300/70">
                  Dashboard Notes
                </span>
              </div>
            </header>

            {/* 레이아웃: 왼쪽 메모 리스트 / 오른쪽 작성 폼 */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)] gap-4 items-start">
              {/* 왼쪽: 메모 리스트 */}
              <div className="space-y-3">
                {memos.length === 0 ? (
                  <p className="rounded-2xl border border-[#292636] bg-[#0c0c11] px-4 py-4 text-xs text-gray-500">
                    아직 등록된 메모가 없습니다. 오른쪽에서 오늘 할 일이나
                    기억해두고 싶은 내용을 작성해보세요.
                  </p>
                ) : (
                  <ul className="space-y-3 text-sm text-gray-200">
                    {memos.map((memo) => (
                      <li
                        key={memo.id}
                        className="rounded-2xl border border-[#292636] bg-[#050509] p-3 break-words"
                      >
                        {/* 상단: 날짜 + 삭제 버튼 */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] text-gray-500">
                            {formatKoreanDate(memo.createdAt).replace(
                              /,\s*\d{1,2}:\d{2}$/,
                              ''
                            )}
                          </span>
                          <form action={deleteMemoAction}>
                            <input type="hidden" name="id" value={memo.id} />
                            <button
                              type="submit"
                              className="rounded-lg border border-gray-700 bg-black/40 px-2.5 py-0.5 text-[10px] text-gray-400 hover:border-pink-500 hover:text-pink-200 transition-colors"
                            >
                              삭제
                            </button>
                          </form>
                        </div>

                        {/* 제목 + 내용 */}
                        <div className="text-sm font-semibold text-pink-200">
                          {memo.title}
                        </div>
                        {memo.content && (
                          <p className="mt-1 text-xs text-gray-400 whitespace-pre-wrap">
                            {memo.content}
                          </p>
                        )}

                        {/* 수정 폼 (접기/펼치기) */}
                        <details className="mt-2">
                          <summary className="cursor-pointer text-[11px] text-gray-500 hover:text-pink-200">
                            메모 수정
                          </summary>
                          <form
                            action={updateMemoAction}
                            className="mt-2 space-y-2 rounded-xl border border-gray-800 bg-black/40 p-3"
                          >
                            <input type="hidden" name="id" value={memo.id} />

                            <div className="space-y-1">
                              <label
                                htmlFor={`edit-title-${memo.id}`}
                                className="block text-[11px] font-medium text-gray-300"
                              >
                                제목
                              </label>
                              <input
                                id={`edit-title-${memo.id}`}
                                name="title"
                                defaultValue={memo.title}
                                className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-xs text-gray-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <label
                                htmlFor={`edit-content-${memo.id}`}
                                className="block text-[11px] font-medium text-gray-300"
                              >
                                내용
                              </label>
                              <textarea
                                id={`edit-content-${memo.id}`}
                                name="content"
                                rows={3}
                                defaultValue={memo.content}
                                className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-xs text-gray-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                              />
                            </div>

                            <button
                              type="submit"
                              className="btn-primary w-full py-1.5 text-[11px] font-semibold"
                            >
                              변경 사항 저장
                            </button>
                          </form>
                        </details>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 오른쪽: 메모 작성 폼 */}
              <form
                action={createMemoAction}
                className="rounded-2xl border border-[#292636] bg-[#0c0c11] px-4 py-4 space-y-3"
              >
                <div className="space-y-1">
                  <label
                    htmlFor="title"
                    className="block text-[11px] font-medium text-gray-200"
                  >
                    제목
                  </label>
                  <input
                    id="title"
                    name="title"
                    className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-xs text-gray-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    placeholder="예) 할 일"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="content"
                    className="block text-[11px] font-medium text-gray-200"
                  >
                    내용 (선택)
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={3}
                    className="w-full rounded-xl border border-gray-700 bg-black/40 px-3 py-2 text-xs text-gray-100 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    placeholder="간단한 할 일이나 메모를 자유롭게 작성해보세요."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-2 text-xs font-semibold"
                >
                  메모 추가하기
                </button>
              </form>
            </div>
          </Card>
        </section>

        {/* 요약 통계 */}
        <section aria-labelledby="summary" className="mb-8">
          <h2 id="summary" className="sr-only">
            Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="프로젝트 수"
              value={String(projectsCount)}
              note="GitHub 공개 레포지토리 기준 (Projects 페이지와 동일)"
            />
            <StatCard
              title="학습 기록"
              value={String(learningStats.totalLogs)}
              note={learningNote}
            />
            <StatCard
              title="최근 커밋"
              value={String(recentCommitCount)}
              note="GitHub Push 이벤트 기준 (최근 8일)"
            />
          </div>
        </section>

        {/* 최근 활동 - Learning / GitHub 분리 */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-3">
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-gray-200">최근 활동</h3>
              <span className="text-[11px] text-pink-300/70">Activity Log</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 학습 활동 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-gray-300">
                    Learning
                  </span>
                  <span className="h-px flex-1 bg-[#2a2535]" />
                </div>

                {learningActivities.length === 0 ? (
                  <p className="rounded-xl border border-[#292636] bg-[#0c0c11] p-3 text-xs text-gray-500">
                    최근 학습 활동이 없습니다.
                  </p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {learningActivities.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-xl border border-[#292636] bg-[#0c0c11] p-4 text-gray-300"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-gray-500">
                            {formatKoreanDate(item.date)}
                          </span>
                        </div>

                        <div className="text-sm font-semibold text-pink-200/80">
                          {item.link ? (
                            <Link
                              href={item.link}
                              className="hover:text-pink-300 transition-colors"
                            >
                              {item.title}
                            </Link>
                          ) : (
                            item.title
                          )}
                        </div>

                        {item.description && (
                          <p className="mt-2 text-xs leading-relaxed text-gray-400">
                            {item.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* GitHub 활동 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-gray-300">
                    GitHub
                  </span>
                  <span className="h-px flex-1 bg-[#2a2535]" />
                </div>

                {githubActivities.length === 0 ? (
                  <p className="rounded-xl border border-[#292636] bg-[#0c0c11] p-3 text-xs text-gray-500">
                    최근 GitHub 활동이 없습니다.
                  </p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {githubActivities.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-xl border border-[#292636] bg-[#0c0c11] p-4 text-gray-300"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-gray-500">
                            {formatKoreanDate(item.date)}
                          </span>
                        </div>

                        <div className="text-sm font-semibold text-pink-200/80">
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-pink-300 transition-colors break-all"
                            >
                              {item.title}
                            </a>
                          ) : (
                            item.title
                          )}
                        </div>

                        {item.description && (
                          <p className="mt-2 text-xs leading-relaxed text-gray-400">
                            {item.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        </section>
      </section>
    </main>
  )
}

/* ───────────── UI Helpers ───────────── */

function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`card-min p-6 ${className}`}>{children}</div>
}

function StatCard({
  title,
  value,
  note,
}: {
  title: string
  value: string
  note?: string
}) {
  return (
    <Card>
      <div className="text-xs text-gray-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-100">{value}</div>
      {note && (
        <div className="mt-2 text-[11px] text-gray-500 break-words">{note}</div>
      )}
    </Card>
  )
}

/* ───────────── Data / Utils ───────────── */

async function getDashboardData(userId: string): Promise<DashboardData> {
  await connectMongoDB()

  const [courseDocs, recentLogDocs, totalLogs, github, memoDocs] =
    await Promise.all([
      Course.find().lean<CourseDoc[]>(),
      StudyLog.find().sort({ createdAt: -1 }).limit(4).lean<StudyLogDoc[]>(), // 최근 학습 활동 4개
      StudyLog.countDocuments().exec(),
      getGithubData(),
      getMemosByUserId(userId),
    ])

  const totalCourses = courseDocs.length
  const completedCourses = courseDocs.filter((c) => c.completed === true).length

  const learningStats: LearningStats = {
    totalCourses,
    completedCourses,
    totalLogs,
    lastStudyLogAt: recentLogDocs[0]?.createdAt ?? null,
  }

  const learningActivities: ActivityItem[] = recentLogDocs.map((doc) => ({
    id: doc._id.toString(),
    type: 'learning',
    title: doc.title,
    description: truncateText(doc.content ?? '', 140),
    date: safeDate(doc.createdAt),
    link: doc.courseId ? `/courses/${doc.courseId.toString()}` : undefined,
  }))

  const githubActivities = github.activities

  const memos: DashboardMemo[] = (memoDocs as DashboardMemoDoc[]).map((m) => ({
    id: m._id.toString(),
    title: m.title,
    content: m.content ?? '',
    createdAt: safeDate(m.createdAt),
    isDone: m.isDone,
  }))

  return {
    learningStats,
    projectsCount: github.projectsCount,
    recentCommitCount: github.recentCommitCount,
    learningActivities,
    githubActivities,
    memos,
  }
}

/**
 * GitHub API를 이용해
 * - Projects 페이지와 동일 기준의 프로젝트 수
 * - 최근 8일 Push 이벤트 기반 최근 커밋 수
 * - GitHub 활동 리스트
 * - 최근 수정 레포 3개
 */
async function getGithubData(): Promise<GithubData> {
  const token = process.env.GITHUB_ACCESS_TOKEN
  const repoUrl = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=30&sort=updated`
  const eventsUrl = `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=60`

  const headers: Record<string, string> = token
    ? { Authorization: `token ${token}` }
    : {}

  try {
    const [reposRes, eventsRes] = await Promise.all([
      fetch(repoUrl, { headers, next: { revalidate: 60 } }),
      fetch(eventsUrl, { headers, next: { revalidate: 60 } }),
    ])

    if (!reposRes.ok) {
      console.error('GitHub repos error:', reposRes.status)
      return {
        projectsCount: 0,
        recentCommitCount: 0,
        activities: [],
        recentRepos: [],
      }
    }

    const repos = (await reposRes.json()) as GhRepo[]
    let events: GhEvent[] = []
    if (eventsRes.ok) {
      events = (await eventsRes.json()) as GhEvent[]
    }

    const projectsCount = repos.length

    // 최근 8일 Push 이벤트 합 -> 최근 커밋 수
    const spark = build8DaySparkline(events)
    const totalPushLast8Days = spark.reduce((a, b) => a + b, 0)
    const recentCommitCount = totalPushLast8Days

    // 최근 수정 레포 상위 3개
    const recentRepos: SimpleRepo[] = [...repos]
      .sort((a, b) => {
        const aTime = new Date(a.pushed_at || a.updated_at || '').getTime()
        const bTime = new Date(b.pushed_at || b.updated_at || '').getTime()
        return bTime - aTime
      })
      .slice(0, 3)
      .map((repo) => ({
        id: String(repo.id),
        name: repo.name,
        description: repo.description ?? '',
        url: repo.html_url,
        updatedAt: safeDate(
          repo.pushed_at || repo.updated_at || repo.created_at
        ),
      }))

    // GitHub 활동: Push 요약 + 레포 업데이트 기록 일부
    const activities: ActivityItem[] = []

    if (totalPushLast8Days > 0) {
      activities.push({
        id: 'github-push-summary',
        type: 'github',
        title: `최근 8일 동안 ${totalPushLast8Days}회 Push`,
        description:
          'GitHub 공개 이벤트 기준으로 계산된 최근 8일간 Push 활동입니다.',
        date: safeDate(events[0]?.created_at ?? new Date()),
        link: `https://github.com/${GITHUB_USERNAME}`,
      })
    }

    const repoActivities: ActivityItem[] = recentRepos.map((repo) => ({
      id: `repo-${repo.id}`,
      type: 'github',
      title: repo.name,
      description: truncateText(repo.description ?? '', 140),
      date: repo.updatedAt,
      link: repo.url,
    }))

    activities.push(...repoActivities)

    return { projectsCount, recentCommitCount, activities, recentRepos }
  } catch (error) {
    console.error('GitHub fetch failed:', error)
    return {
      projectsCount: 0,
      recentCommitCount: 0,
      activities: [],
      recentRepos: [],
    }
  }
}

/** 최근 8일 Push 이벤트 수를 일자별로 계산 (메인 페이지와 동일 로직) */
function build8DaySparkline(events: GhEvent[]): number[] {
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

/** 안전하게 한국식 날짜 문자열로 포맷 */
function formatKoreanDate(
  value: string | number | Date | null | undefined
): string {
  try {
    if (!value) return '-'

    const d = value instanceof Date ? value : new Date(value)

    if (Number.isNaN(d.getTime())) return '-'

    return new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d)
  } catch {
    return '-'
  }
}

/** Date로 안전 변환 */
function safeDate(value: string | number | Date | null | undefined): Date {
  if (value instanceof Date) return value
  const d = new Date(value ?? new Date())
  if (Number.isNaN(d.getTime())) return new Date()
  return d
}

/** 설명 텍스트 길이를 너무 길지 않게 잘라주는 헬퍼 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}
