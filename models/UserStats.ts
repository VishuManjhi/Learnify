import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface IUserStats extends Document {
    userId: mongoose.Types.ObjectId
    totalPoints: number
    currentLevel: number
    levelProgress: number
    lessonsCompleted: number
    quizzesCompleted: number
    coursesEnrolled: number
    updatedAt: Date
}

const UserStatsSchema = new Schema<IUserStats>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        totalPoints: { type: Number, default: 0 },
        currentLevel: { type: Number, default: 1 },
        levelProgress: { type: Number, default: 0 },
        lessonsCompleted: { type: Number, default: 0 },
        quizzesCompleted: { type: Number, default: 0 },
        coursesEnrolled: { type: Number, default: 0 },
    },
    { timestamps: true },
)

export default models.UserStats || model<IUserStats>("UserStats", UserStatsSchema)
