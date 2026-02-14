import mongoose, { Schema, type Document, models, model } from "mongoose"

export interface IQuestion {
    questionText: string
    questionType: "multiple_choice" | "short_answer" | "true_false"
    points: number
    options?: {
        text: string
        isCorrect: boolean
    }[]
}

export interface IQuiz extends Document {
    lessonId: mongoose.Types.ObjectId
    title: string
    description?: string
    questions: IQuestion[]
    passingScore: number
    createdAt: Date
    updatedAt: Date
}

const QuestionSchema = new Schema<IQuestion>({
    questionText: { type: String, required: true },
    questionType: {
        type: String,
        enum: ["multiple_choice", "short_answer", "true_false"],
        required: true,
    },
    points: { type: Number, default: 1 },
    options: [
        {
            text: { type: String, required: true },
            isCorrect: { type: Boolean, default: false },
        },
    ],
})

const QuizSchema = new Schema<IQuiz>(
    {
        lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
        title: { type: String, required: true },
        description: { type: String },
        questions: [QuestionSchema],
        passingScore: { type: Number, default: 70 },
    },
    { timestamps: true },
)

export default models.Quiz || model<IQuiz>("Quiz", QuizSchema)
