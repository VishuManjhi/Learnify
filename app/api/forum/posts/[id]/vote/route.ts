import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ForumPost from "@/models/ForumPost"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
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
    const { voteType } = body // "upvote" or "downvote"
    const userId = (session.user as any).id

    const post = await ForumPost.findById(id)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const userIdObj = userId as any

    // Remove from opposite vote array
    if (voteType === "upvote") {
      post.downvotes = post.downvotes.filter(
        (id) => id.toString() !== userIdObj.toString(),
      )
      if (post.upvotes.some((id) => id.toString() === userIdObj.toString())) {
        // Already upvoted, remove upvote
        post.upvotes = post.upvotes.filter(
          (id) => id.toString() !== userIdObj.toString(),
        )
      } else {
        // Add upvote
        post.upvotes.push(userIdObj)
      }
    } else if (voteType === "downvote") {
      post.upvotes = post.upvotes.filter(
        (id) => id.toString() !== userIdObj.toString(),
      )
      if (post.downvotes.some((id) => id.toString() === userIdObj.toString())) {
        // Already downvoted, remove downvote
        post.downvotes = post.downvotes.filter(
          (id) => id.toString() !== userIdObj.toString(),
        )
      } else {
        // Add downvote
        post.downvotes.push(userIdObj)
      }
    }

    await post.save()

    return NextResponse.json({
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to vote on post" },
      { status: 500 },
    )
  }
}
