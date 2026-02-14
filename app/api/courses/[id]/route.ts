import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Course from "@/models/Course"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const { id } = await params // Await params in Next.js 15+ (v16 likely too)

    const course = await Course.findById(id).populate("teacherId", "name avatarUrl")

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch course" },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { id } = await params
    const body = await request.json()

    // Check ownership
    const course = await Course.findById(id)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.teacherId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, body, { new: true })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update course" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { id } = await params

    // Check ownership
    const course = await Course.findById(id)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.teacherId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await Course.findByIdAndDelete(id)

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete course" },
      { status: 500 },
    )
  }
}
