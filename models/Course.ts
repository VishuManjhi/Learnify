import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface ICourse extends Document {
    title: string
    description: string
    teacherId: mongoose.Types.ObjectId
    category: string
    difficultyLevel: "beginner" | "intermediate" | "advanced"
    isPublished: boolean
    imageUrl?: string
    pointsPerLesson: number
    createdAt: Date
    updatedAt: Date
}

const CourseSchema = new Schema<ICourse>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        category: { type: String, required: true },
        difficultyLevel: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "intermediate",
        },
        isPublished: { type: Boolean, default: false },
        imageUrl: { type: String },
        pointsPerLesson: { type: Number, default: 10 },
    },
    { timestamps: true },
)

export default models.Course || model<ICourse>("Course", CourseSchema)
