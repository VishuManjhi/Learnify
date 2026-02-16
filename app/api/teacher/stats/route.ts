import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Course from "@/models/Course"
import Enrollment from "@/models/Enrollment"
import Lesson from "@/models/Lesson"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const teacherId = (session.user as any).id

    // Get all courses owned by this teacher
    const courses = await Course.find({ teacherId })
    const courseIds = courses.map((c) => c._id)

    // Get total enrollments
    const totalEnrollments = await Enrollment.countDocuments({
      courseId: { $in: courseIds },
    })

    // Get unique students
    const enrollments = await Enrollment.find({
      courseId: { $in: courseIds },
    }).distinct("studentId")

    // Get total lessons across all courses
    const totalLessons = await Lesson.countDocuments({
      courseId: { $in: courseIds },
    })

    // Get published vs draft courses
    const publishedCourses = courses.filter((c) => c.isPublished).length
    const draftCourses = courses.length - publishedCourses

    return NextResponse.json({
      totalCourses: courses.length,
      publishedCourses,
      draftCourses,
      totalStudents: enrollments.length,
      totalEnrollments,
      totalLessons,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch teacher stats" },
      { status: 500 },
    )
  }
}
