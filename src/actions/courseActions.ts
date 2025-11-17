// src/actions/courseActions.ts
'use server'

import Course from '@/models/course'
import connectMongoDB from '@/libs/mongodb'
import { revalidatePath } from 'next/cache'
import type { Course as CourseType } from '@/types/course'

// MongoDB에서 lean()으로 내려오는 코스 도큐먼트 타입
type CourseDoc = {
  _id: { toString(): string }
  title: string
  description?: string | null
  level?: string | null
  category?: string | null
  link?: string | null
  completed?: boolean
  createdAt?: Date
  updatedAt?: Date
}

function mapCourse(doc: CourseDoc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? '',
    level: doc.level ?? '',
    category: doc.category ?? '',
    link: doc.link ?? '',
    completed: Boolean(doc.completed),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

/**
 * DB에 저장된 모든 강의(학습 항목) 가져오기
 */
export async function getAllCourses(): Promise<CourseType[]> {
  await connectMongoDB()

  const docs = await Course.find().sort({ createdAt: -1 }).lean<CourseDoc[]>()

  return docs.map(mapCourse)
}

/**
 * 특정 강의 하나 조회
 */
export async function getCourseById(id: string) {
  await connectMongoDB()

  const doc = await Course.findById(id).lean<CourseDoc | null>()

  if (!doc) return null

  return mapCourse(doc)
}

/**
 * 새 강의(학습 항목) 생성
 */
export async function createCourse(input: {
  title: string
  description?: string
  level?: string
  category?: string
  link?: string
}) {
  await connectMongoDB()

  const { title, description, level, category, link } = input

  await Course.create({
    title,
    description: description ?? '',
    level: level ?? '',
    category: category ?? '',
    link: link ?? '',
  })
}

/**
 * 강의 내용 수정
 */
export async function updateCourse(
  id: string,
  input: {
    title: string
    description?: string
    level?: string
    category?: string
    link?: string
  }
) {
  await connectMongoDB()

  const { title, description, level, category, link } = input

  await Course.findByIdAndUpdate(
    id,
    {
      title,
      description: description ?? '',
      level: level ?? '',
      category: category ?? '',
      link: link ?? '',
    },
    { new: true }
  )
}

/**
 * 강의 완료 상태 토글
 */
export async function toggleCourseCompleted(id: string) {
  await connectMongoDB()

  const course = await Course.findById(id)

  if (!course) {
    throw new Error('Course not found')
  }

  course.completed = !course.completed
  await course.save()

  // 목록 페이지와 상세 페이지 캐시 무효화
  revalidatePath('/courses')
  revalidatePath(`/courses/${id}`)
}

/**
 * 강의 삭제
 */
export async function deleteCourse(id: string) {
  await connectMongoDB()

  await Course.findByIdAndDelete(id)
}
