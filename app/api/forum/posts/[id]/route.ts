import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ForumPost from "@/models/ForumPost"
import ForumReply from "@/models/ForumReply"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase()
    const { id } = await params

    const post = await ForumPost.findById(id)
      .populate("authorId", "name email avatarUrl")
      .populate("courseId", "title")
      .populate("upvotes", "name")
      .populate("downvotes", "name")

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Increment view count
    post.views += 1
    await post.save()

    // Get replies
    const replies = await ForumReply.find({ postId: id })
      .populate("authorId", "name email avatarUrl")
      .populate("parentReplyId")
      .sort({ isSolution: -1, createdAt: 1 })

    return NextResponse.json({ post, replies })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch forum post" },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { id } = await params
    const body = await request.json()
    const user = session.user as any

    const post = await ForumPost.findById(id)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Only author can edit
    if (post.authorId.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedPost = await ForumPost.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true },
    )
      .populate("authorId", "name email avatarUrl")
      .populate("courseId", "title")

    return NextResponse.json(updatedPost)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update forum post" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { id } = await params
    const user = session.user as any

    const post = await ForumPost.findById(id)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Only author or admin can delete
    if (post.authorId.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete all replies
    await ForumReply.deleteMany({ postId: id })

    // Delete post
    await ForumPost.findByIdAndDelete(id)

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete forum post" },
      { status: 500 },
    )
  }
}
