import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Enrollment from "@/models/Enrollment"
import Course from "@/models/Course"
import Lesson from "@/models/Lesson"
import Quiz from "@/models/Quiz"
import QuizAttempt from "@/models/QuizAttempt"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const studentId = (session.user as any).id

    // Enrollments for this student
    const enrollments = await Enrollment.find({ studentId }).populate("courseId", "title description")

    const courseMap = new Map<
      string,
      {
        _id: string
        title: string
        description: string
      }
    >()

    for (const enrollment of enrollments as any[]) {
      const course = enrollment.courseId
      if (!course) continue
      const id = course._id.toString()
      if (!courseMap.has(id)) {
        courseMap.set(id, {
          _id: id,
          title: course.title || "Untitled course",
          description: course.description || "",
        })
      }
    }

    const courses = Array.from(courseMap.values())

    // Quizzes for lessons in the student's courses
    const courseIds = courses.map((c) => c._id)
    let quizzes: any[] = []

    if (courseIds.length > 0) {
      const lessons = await Lesson.find({ courseId: { $in: courseIds } }).select("_id title courseId")
      const lessonIds = lessons.map((l) => l._id)

      if (lessonIds.length > 0) {
        quizzes = await Quiz.find({ lessonId: { $in: lessonIds } }).select(
          "_id title description lessonId passingScore",
        )

        const quizIds = quizzes.map((q) => q._id)

        const attempts = await QuizAttempt.find({
          studentId,
          quizId: { $in: quizIds },
        }).select("quizId passed score percentage createdAt")

        const attemptsMap = new Map<
          string,
          {
            passed: boolean
            score: number
            percentage: number
            createdAt: Date
          }
        >()

        for (const attempt of attempts as any[]) {
          const qid = attempt.quizId.toString()
          // Keep the latest attempt per quiz
          const existing = attemptsMap.get(qid)
          if (!existing || existing.createdAt < attempt.createdAt) {
            attemptsMap.set(qid, {
              passed: attempt.passed,
              score: attempt.score,
              percentage: attempt.percentage,
              createdAt: attempt.createdAt,
            })
          }
        }

        const lessonMap = new Map<string, { _id: string; title: string; courseId: string }>()
        for (const lesson of lessons as any[]) {
          lessonMap.set(lesson._id.toString(), {
            _id: lesson._id.toString(),
            title: lesson.title || "Untitled lesson",
            courseId: lesson.courseId.toString(),
          })
        }

        quizzes = quizzes.map((quiz: any) => {
          const qid = quiz._id.toString()
          const lesson = lessonMap.get(quiz.lessonId.toString())
          const course = lesson ? courseMap.get(lesson.courseId) : undefined
          const attempt = attemptsMap.get(qid)

          return {
            _id: qid,
            title: quiz.title || "Untitled quiz",
            description: quiz.description || "",
            passingScore: quiz.passingScore,
            lessonId: lesson?._id || "",
            lessonTitle: lesson?.title || "",
            courseId: course?._id || "",
            courseTitle: course?.title || "",
            attempted: !!attempt,
            passed: attempt?.passed ?? false,
            lastScore: attempt?.score ?? null,
            lastPercentage: attempt?.percentage ?? null,
          }
        })
      }
    }

    return NextResponse.json({ courses, quizzes })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load student courses" },
      { status: 500 },
    )
  }
}

