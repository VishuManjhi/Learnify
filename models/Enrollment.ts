import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface IEnrollment extends Document {
    courseId: mongoose.Types.ObjectId
    studentId: mongoose.Types.ObjectId
    enrolledAt: Date
    completedAt?: Date
}

const EnrollmentSchema = new Schema<IEnrollment>({
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
})

// Prevent duplicate enrollments
EnrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true })

export default models.Enrollment || model<IEnrollment>("Enrollment", EnrollmentSchema)
