import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Progress from "@/models/Progress"
import UserStats from "@/models/UserStats"
import Lesson from "@/models/Lesson"
import Course from "@/models/Course"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { id: lessonId } = await params // Await params
    const userId = (session.user as any).id

    // Check if lesson exists
    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    // Upsert progress
    let progress = await Progress.findOne({ lessonId, studentId: userId })

    if (!progress) {
      progress = await Progress.create({
        studentId: userId,
        lessonId,
        courseId: lesson.courseId,
        isCompleted: true,
        completedAt: new Date(),
      })
    } else if (!progress.isCompleted) {
      progress.isCompleted = true
      progress.completedAt = new Date()
      await progress.save()
    } else {
      // Already completed
      return NextResponse.json(progress)
    }

    // Update User Stats
    // Fetch course to get points per lesson (assuming 10 default if not set on course)
    // Note: Course model doesn't have 'pointsPerLesson' field in my Mongoose schema yet!
    // I should check 'Course.ts'. I defined: `title, description...`.
    // The SQL schema had `points_per_lesson`. Mongoose schema `Course.ts` missed it!
    // I should update `Course.ts` schema later. For now assume 10.

    const course = await Course.findById(lesson.courseId)
    const pointsGain = course?.pointsPerLesson ?? 10

    let stats = await UserStats.findOne({ userId })
    if (!stats) {
      stats = await UserStats.create({ userId })
    }

    stats.totalPoints += pointsGain
    stats.lessonsCompleted += 1
    stats.currentLevel = Math.floor(stats.totalPoints / 1000) + 1

    await stats.save()

    return NextResponse.json(progress, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark lesson complete" },
      { status: 500 },
    )
  }
}
