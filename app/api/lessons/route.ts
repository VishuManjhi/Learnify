import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Lesson from "@/models/Lesson"
import Course from "@/models/Course"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    const lessons = await Lesson.find({ courseId }).sort({ orderIndex: 1 })

    return NextResponse.json(lessons)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch lessons" },
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
    const { courseId, title, content, orderIndex, durationMinutes } = body

    // Verify course ownership
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.teacherId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const lesson = await Lesson.create({
      courseId,
      title,
      content,
      orderIndex,
      durationMinutes,
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create lesson" },
      { status: 500 },
    )
  }
}
