import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ForumReply from "@/models/ForumReply"
import ForumPost from "@/models/ForumPost"
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
    const { postId, content, parentReplyId } = body

    if (!postId || !content) {
      return NextResponse.json(
        { error: "Post ID and content are required" },
        { status: 400 },
      )
    }

    // Check if post exists and is not locked
    const post = await ForumPost.findById(postId)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (post.isLocked) {
      return NextResponse.json(
        { error: "This post is locked and cannot be replied to" },
        { status: 403 },
      )
    }

    const user = session.user as any

    // Only students can reply
    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can reply to forum posts" },
        { status: 403 },
      )
    }

    const reply = await ForumReply.create({
      postId,
      authorId: user.id,
      content,
      parentReplyId: parentReplyId || null,
    })

    // Update reply count on post
    post.replyCount += 1
    await post.save()

    const populatedReply = await ForumReply.findById(reply._id)
      .populate("authorId", "name email avatarUrl")
      .populate("parentReplyId")

    return NextResponse.json(populatedReply, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create reply" },
      { status: 500 },
    )
  }
}
