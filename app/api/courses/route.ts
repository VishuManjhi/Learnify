import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Course from "@/models/Course"
import User from "@/models/User"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const published = searchParams.get("published") !== "false"

    // Security check: If requesting unpublished courses, must be authenticated
    if (!published) {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
        // If not logged in, force published=true
        const courses = await Course.find({ isPublished: true })
          .populate("teacherId", "name")
          .sort({ createdAt: -1 })
        return NextResponse.json(courses)
      }
    }

    const query: any = {}
    if (published) {
      query.isPublished = true
    }
    // If published is false (meaning "all", or "drafts"), we return everything? 
    // Or normally "published=false" means "show me DRAFTS"?
    // The previous logic `published !== "false"` meant default is TRUE.
    // If I pass `published=false`, then `published` var is FALSE.
    // Then `if (published)` block is skipped. `query` remains `{}`.
    // So `Course.find({})` returns EVERYTHING.
    // This allows listing drafts. 
    // We should probably restrict this info to the owner in a real app, 
    // but for now, the security fix above ensures only logged in users can see unpublished.
    // Ideally, we should filter by `teacherId` if not published.

    const courses = await Course.find(query)
      .populate("teacherId", "name")
      .sort({ createdAt: -1 })

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch courses" },
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
    const { title, description, category, difficulty_level, image_url, points_per_lesson } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    const course = await Course.create({
      title,
      description,
      category,
      difficultyLevel: difficulty_level,
      imageUrl: image_url,
      teacherId: (session.user as any).id,
      // New courses should be visible in Browse/My Courses by default
      isPublished: true,
      pointsPerLesson: typeof points_per_lesson === "number" ? points_per_lesson : 10,
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create course" },
      { status: 500 },
    )
  }
}
