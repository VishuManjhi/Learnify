import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface INotification extends Document {
    recipientId: mongoose.Types.ObjectId
    notificationType: "enrollment" | "quiz_result" | "course_complete" | "badge_earned"
    relatedCourseId?: mongoose.Types.ObjectId
    title: string
    message?: string
    read: boolean
    createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
    {
        recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        notificationType: {
            type: String,
            enum: ["enrollment", "quiz_result", "course_complete", "badge_earned"],
            required: true,
        },
        relatedCourseId: { type: Schema.Types.ObjectId, ref: "Course" },
        title: { type: String, required: true },
        message: { type: String },
        read: { type: Boolean, default: false },
    },
    { timestamps: true },
)

export default models.Notification || model<INotification>("Notification", NotificationSchema)
