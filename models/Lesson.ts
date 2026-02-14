import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface ILesson extends Document {
    courseId: mongoose.Types.ObjectId
    title: string
    content: string
    orderIndex: number
    durationMinutes: number
    createdAt: Date
    updatedAt: Date
}

const LessonSchema = new Schema<ILesson>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        orderIndex: { type: Number, required: true },
        durationMinutes: { type: Number, default: 30 },
    },
    { timestamps: true },
)

export default models.Lesson || model<ILesson>("Lesson", LessonSchema)
