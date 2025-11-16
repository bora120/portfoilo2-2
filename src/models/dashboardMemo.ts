// src/models/dashboardMemo.ts
import mongoose, { Schema, Model, models } from 'mongoose'

export interface DashboardMemoDocument {
  _id: mongoose.Types.ObjectId
  userId: string
  title: string
  content?: string
  isDone: boolean
  createdAt: Date
  updatedAt: Date
}

const DashboardMemoSchema = new Schema<DashboardMemoDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    isDone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
)

const DashboardMemo: Model<DashboardMemoDocument> =
  models.DashboardMemo ||
  mongoose.model<DashboardMemoDocument>('DashboardMemo', DashboardMemoSchema)

export default DashboardMemo
