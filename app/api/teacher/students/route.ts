import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Course from "@/models/Course"
import Enrollment from "@/models/Enrollment"
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

    // Find all courses owned by this teacher
    const courses = await Course.find({ teacherId }).select("_id title")
    if (!courses.length) {
      return NextResponse.json([])
    }

    const courseIds = courses.map((c) => c._id)

    // Find enrollments for these courses and populate student + course
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate("studentId", "name email")
      .populate("courseId", "title")

    type AggregatedStudent = {
      studentId: string
      name: string
      email: string
      courses: { courseId: string; title: string }[]
    }

    const studentsMap = new Map<string, AggregatedStudent>()

    for (const enrollment of enrollments as any[]) {
      const student = enrollment.studentId
      const course = enrollment.courseId
      if (!student) continue

      const key = student._id.toString()
      if (!studentsMap.has(key)) {
        studentsMap.set(key, {
          studentId: key,
          name: student.name || "Unknown",
          email: student.email || "",
          courses: [],
        })
      }

      const entry = studentsMap.get(key)!
      if (course) {
        const courseId = course._id.toString()
        if (!entry.courses.find((c) => c.courseId === courseId)) {
          entry.courses.push({
            courseId,
            title: course.title || "Untitled course",
          })
        }
      }
    }

    return NextResponse.json(Array.from(studentsMap.values()))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load teacher students" },
      { status: 500 },
    )
  }
}

