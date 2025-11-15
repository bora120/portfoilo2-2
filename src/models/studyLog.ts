// src/models/studyLog.ts
import mongoose, { Schema, models, model } from 'mongoose'

const studyLogSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

const StudyLog = models.StudyLog || model('StudyLog', studyLogSchema)

export default StudyLog
