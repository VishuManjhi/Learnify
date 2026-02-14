import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface IUser extends Document {
    email: string
    password?: string
    name: string
    role: "student" | "teacher" | "admin"
    avatarUrl?: string
    bio?: string
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false }, // Hide password by default
        name: { type: String, required: true },
        role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
        avatarUrl: { type: String },
        bio: { type: String },
    },
    { timestamps: true },
)

export default models.User || model<IUser>("User", UserSchema)
