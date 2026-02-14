import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface IBadge extends Document {
    name: string
    description: string
    iconUrl: string
    requirementType: "points" | "lessons" | "quizzes" | "courses"
    requirementValue: number
    createdAt: Date
}

const BadgeSchema = new Schema<IBadge>({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    iconUrl: { type: String },
    requirementType: {
        type: String,
        enum: ["points", "lessons", "quizzes", "courses"],
        required: true,
    },
    requirementValue: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
})

export default models.Badge || model<IBadge>("Badge", BadgeSchema)

export interface IUserBadge extends Document {
    userId: mongoose.Types.ObjectId
    badgeId: mongoose.Types.ObjectId
    earnedAt: Date
}

const UserBadgeSchema = new Schema<IUserBadge>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    badgeId: { type: Schema.Types.ObjectId, ref: "Badge", required: true },
    earnedAt: { type: Date, default: Date.now },
})

UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true })

export const UserBadge = models.UserBadge || model<IUserBadge>("UserBadge", UserBadgeSchema)
