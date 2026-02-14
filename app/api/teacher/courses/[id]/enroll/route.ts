import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Course from "@/models/Course"
import User from "@/models/User"
import Enrollment from "@/models/Enrollment"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface BulkEnrollRequestBody {
  emails?: string[]
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // In newer Next.js versions, `params` may be a Promise-like object,
    // so we mirror the pattern used elsewhere in this codebase.
    const { id } = await (params as any)
    const courseId = id
    const body = (await request.json()) as BulkEnrollRequestBody
    const rawEmails = Array.isArray(body.emails) ? body.emails : []

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    if (rawEmails.length === 0) {
      return NextResponse.json({ error: "At least one email is required" }, { status: 400 })
    }

    // Ensure the requesting user is the course teacher
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.teacherId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Normalize and de-duplicate emails
    const normalizedEmails = Array.from(
      new Set(
        rawEmails
          .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
          .filter((e) => e.length > 0),
      ),
    )

    if (normalizedEmails.length === 0) {
      return NextResponse.json({ error: "No valid email addresses provided" }, { status: 400 })
    }

    // Find existing users by email
    const users = await User.find({ email: { $in: normalizedEmails } })
    const usersByEmail = new Map<string, (typeof users)[number]>()
    for (const user of users) {
      usersByEmail.set(user.email.toLowerCase(), user)
    }

    const enrolled: { email: string; userId: string }[] = []
    const alreadyEnrolled: { email: string; userId: string }[] = []
    const notFound: string[] = []

    for (const email of normalizedEmails) {
      const user = usersByEmail.get(email)
      if (!user) {
        notFound.push(email)
        continue
      }

      const existing = await Enrollment.findOne({
        courseId,
        studentId: user._id,
      })

      if (existing) {
        alreadyEnrolled.push({ email, userId: user._id.toString() })
        continue
      }

      await Enrollment.create({
        courseId,
        studentId: user._id,
      })

      enrolled.push({ email, userId: user._id.toString() })
    }

    return NextResponse.json(
      {
        enrolled,
        alreadyEnrolled,
        notFound,
        summary: {
          totalRequested: normalizedEmails.length,
          enrolled: enrolled.length,
          alreadyEnrolled: alreadyEnrolled.length,
          notFound: notFound.length,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to enroll students" },
      { status: 500 },
    )
  }
}

