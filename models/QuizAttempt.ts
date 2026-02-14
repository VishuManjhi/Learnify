import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface IQuizAttempt extends Document {
    quizId: mongoose.Types.ObjectId
    studentId: mongoose.Types.ObjectId
    score: number
    percentage: number
    passed: boolean
    answers: {
        questionId: mongoose.Types.ObjectId
        answer: string // Option ID or text
        isCorrect: boolean
    }[]
    createdAt: Date
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
    {
        quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
        studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        score: { type: Number, required: true },
        percentage: { type: Number, required: true },
        passed: { type: Boolean, required: true },
        answers: [
            {
                questionId: { type: Schema.Types.ObjectId, required: true },
                answer: { type: String, required: true },
                isCorrect: { type: Boolean, required: true },
            },
        ],
    },
    { timestamps: true },
)

export default models.QuizAttempt || model<IQuizAttempt>("QuizAttempt", QuizAttemptSchema)
