import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface IForumReply extends Document {
    postId: mongoose.Types.ObjectId
    authorId: mongoose.Types.ObjectId
    content: string
    upvotes: mongoose.Types.ObjectId[]
    downvotes: mongoose.Types.ObjectId[]
    parentReplyId?: mongoose.Types.ObjectId // For nested replies
    isSolution: boolean // Mark as solution to the post
    createdAt: Date
    updatedAt: Date
}

const ForumReplySchema = new Schema<IForumReply>(
    {
        postId: { type: Schema.Types.ObjectId, ref: "ForumPost", required: true },
        authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        parentReplyId: { type: Schema.Types.ObjectId, ref: "ForumReply" }, // For nested replies
        isSolution: { type: Boolean, default: false },
    },
    { timestamps: true },
)

// Indexes
ForumReplySchema.index({ postId: 1, createdAt: 1 })
ForumReplySchema.index({ authorId: 1 })
ForumReplySchema.index({ parentReplyId: 1 })

export default models.ForumReply || model<IForumReply>("ForumReply", ForumReplySchema)
