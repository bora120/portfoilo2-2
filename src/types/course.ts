// src/types/course.ts
export interface Course {
  id: string
  title: string
  description: string
  level: string
  category: string
  link: string
  completed: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}
