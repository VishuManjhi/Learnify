import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface IProgress extends Document {
    studentId: mongoose.Types.ObjectId
    lessonId: mongoose.Types.ObjectId
    courseId: mongoose.Types.ObjectId
    isCompleted: boolean
    completedAt?: Date
}

const ProgressSchema = new Schema<IProgress>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
        courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date },
    },
    { timestamps: true },
)

ProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true })

export default models.Progress || model<IProgress>("Progress", ProgressSchema)
