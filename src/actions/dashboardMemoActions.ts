// src/actions/dashboardMemoActions.ts
'use server'

import connectMongoDB from '@/libs/mongodb'
import DashboardMemo, { DashboardMemoDocument } from '@/models/dashboardMemo'

/** 특정 유저의 메모 리스트 가져오기 */
export async function getMemosByUserId(
  userId: string
): Promise<DashboardMemoDocument[]> {
  if (!userId) return []

  await connectMongoDB()

  const memos = await DashboardMemo.find({ userId })
    .sort({ createdAt: -1 }) // 최신순
    .limit(10) // 필요하면 조절
    .lean<DashboardMemoDocument[]>()

  return memos
}

/** 새 메모 생성 */
export async function createDashboardMemo(params: {
  userId: string
  title: string
  content?: string
}) {
  const { userId, title, content } = params

  if (!userId || !title?.trim()) {
    return
  }

  await connectMongoDB()

  await DashboardMemo.create({
    userId,
    title: title.trim(),
    content: content?.trim() ?? '',
  })
}

/** 메모 내용 수정 */
export async function updateDashboardMemo(params: {
  id: string
  userId: string
  title?: string
  content?: string
}) {
  const { id, userId, title, content } = params

  if (!id || !userId) return

  await connectMongoDB()

  const update: Partial<Pick<DashboardMemoDocument, 'title' | 'content'>> = {}

  if (typeof title === 'string') {
    update.title = title.trim()
  }
  if (typeof content === 'string') {
    update.content = content.trim()
  }

  if (Object.keys(update).length === 0) return

  await DashboardMemo.findOneAndUpdate({ _id: id, userId }, { $set: update })
}

/** 메모 완료 상태 토글 (옵션 기능) */
export async function toggleDashboardMemoDone(id: string, userId: string) {
  if (!id || !userId) return

  await connectMongoDB()

  const memo = await DashboardMemo.findOne({ _id: id, userId })

  if (!memo) return

  memo.isDone = !memo.isDone
  await memo.save()
}

/** 메모 삭제 */
export async function deleteDashboardMemo(id: string, userId: string) {
  if (!id || !userId) return

  await connectMongoDB()

  await DashboardMemo.deleteOne({ _id: id, userId })
}
