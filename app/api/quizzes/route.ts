import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Quiz from "@/models/Quiz"
import Lesson from "@/models/Lesson"
import Course from "@/models/Course"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lesson_id") // Keep snake_case param to match frontend?

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 })
    }

    const quizzes = await Quiz.find({ lessonId })

    return NextResponse.json(quizzes)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch quizzes" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const body = await request.json()
    const { lessonId, title, description, questions, passingScore } = body

    if (!lessonId || !title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Lesson ID, title, and at least one question are required" },
        { status: 400 },
      )
    }

    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const course = await Course.findById(lesson.courseId)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.teacherId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const quiz = await Quiz.findOneAndUpdate(
      { lessonId },
      {
        lessonId,
        title,
        description,
        questions,
        passingScore: typeof passingScore === "number" ? passingScore : 70,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    return NextResponse.json(quiz, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save quiz" },
      { status: 500 },
    )
  }
}

