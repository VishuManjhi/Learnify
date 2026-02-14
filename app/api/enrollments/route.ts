import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Enrollment from "@/models/Enrollment"
import User from "@/models/User"
import Course from "@/models/Course"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      courseId,
      studentId: (session.user as any).id,
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 })
    }

    const enrollment = await Enrollment.create({
      courseId,
      studentId: (session.user as any).id,
    })

    // Update user stats (optional, if needed for "courses_enrolled" count logic, 
    // though that might be calculated dynamically or in a separate stats collection)
    // For now, let's keep it simple. The user_stats table had a count. Only if I replicate that logic.
    // The Progress model handles "lessons completed". "Enrolled courses" count can be aggregated.

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to enroll" },
      { status: 500 },
    )
  }
}
