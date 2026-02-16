import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface IForumPost extends Document {
    title: string
    content: string
    authorId: mongoose.Types.ObjectId
    courseId?: mongoose.Types.ObjectId // Optional: can be general or course-specific
    tags: string[]
    upvotes: mongoose.Types.ObjectId[] // Users who upvoted
    downvotes: mongoose.Types.ObjectId[] // Users who downvoted
    replyCount: number
    isPinned: boolean
    isLocked: boolean
    views: number
    createdAt: Date
    updatedAt: Date
}

const ForumPostSchema = new Schema<IForumPost>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        courseId: { type: Schema.Types.ObjectId, ref: "Course" }, // null for general discussions
        tags: [{ type: String }],
        upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        replyCount: { type: Number, default: 0 },
        isPinned: { type: Boolean, default: false },
        isLocked: { type: Boolean, default: false },
        views: { type: Number, default: 0 },
    },
    { timestamps: true },
)

// Indexes for better query performance
ForumPostSchema.index({ courseId: 1, createdAt: -1 })
ForumPostSchema.index({ authorId: 1 })
ForumPostSchema.index({ isPinned: -1, createdAt: -1 })
ForumPostSchema.index({ tags: 1 })

export default models.ForumPost || model<IForumPost>("ForumPost", ForumPostSchema)
