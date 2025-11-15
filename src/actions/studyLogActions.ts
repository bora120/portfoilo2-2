// src/actions/studyLogActions.ts
'use server'

import connectMongoDB from '@/libs/mongodb'
import StudyLog from '@/models/studyLog'

// MongoDB에서 lean()으로 내려오는 학습 기록 도큐먼트 타입
type StudyLogDoc = {
  _id: { toString(): string }
  courseId: { toString(): string } | string
  title: string
  content: string
  createdAt?: Date
  updatedAt?: Date
}

function mapLog(doc: StudyLogDoc) {
  return {
    id: doc._id.toString(),
    courseId: doc.courseId.toString(),
    title: doc.title,
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

/** 특정 강의의 학습 기록 목록 조회 */
export async function getLogsByCourseId(courseId: string) {
  await connectMongoDB()

  const docs = await StudyLog.find({ courseId })
    .sort({ createdAt: -1 })
    .lean<StudyLogDoc[]>()

  return docs.map(mapLog)
}

/** 새 학습 기록 추가 */
export async function createStudyLog(input: {
  courseId: string
  title: string
  content: string
}) {
  await connectMongoDB()
  await StudyLog.create(input)
}

/** 학습 기록 수정 */
export async function updateStudyLog(
  id: string,
  input: { title: string; content: string }
) {
  await connectMongoDB()
  await StudyLog.findByIdAndUpdate(id, input, { new: true })
}

/** 학습 기록 삭제 */
export async function deleteStudyLog(id: string) {
  await connectMongoDB()
  await StudyLog.findByIdAndDelete(id)
}
