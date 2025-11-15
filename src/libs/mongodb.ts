// src/libs/mongodb.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

/**
 * MongoDB 연결 헬퍼
 * - 이미 연결된 경우 재연결하지 않음
 */
export async function connectMongoDB() {
  if (mongoose.connection.readyState >= 1) {
    return
  }

  await mongoose.connect(MONGODB_URI)
}

export default connectMongoDB
