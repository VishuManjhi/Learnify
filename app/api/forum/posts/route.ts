import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ForumPost from "@/models/ForumPost"
import ForumReply from "@/models/ForumReply"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const query: any = {}
    if (courseId) {
      query.courseId = courseId
    } else {
      // General forum posts (no courseId)
      query.courseId = null
    }

    // Get posts sorted by pinned first, then by creation date
    const posts = await ForumPost.find(query)
      .populate("authorId", "name email avatarUrl")
      .populate("courseId", "title")
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await ForumPost.countDocuments(query)

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch forum posts" },
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
    const { title, content, courseId, tags } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 },
      )
    }

    // Only students can create posts
    const user = session.user as any
    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can create forum posts" },
        { status: 403 },
      )
    }

    const post = await ForumPost.create({
      title,
      content,
      authorId: user.id,
      courseId: courseId || null,
      tags: tags || [],
    })

    const populatedPost = await ForumPost.findById(post._id)
      .populate("authorId", "name email avatarUrl")
      .populate("courseId", "title")

    return NextResponse.json(populatedPost, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create forum post" },
      { status: 500 },
    )
  }
}
