"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  ArrowLeft,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Reply,
  Eye,
  Clock,
  CheckCircle2,
} from "lucide-react"

interface ForumPost {
  _id: string
  title: string
  content: string
  authorId: {
    _id: string
    name: string
    email: string
    avatarUrl?: string
  }
  courseId?: {
    _id: string
    title: string
  }
  tags: string[]
  upvotes: any[]
  downvotes: any[]
  replyCount: number
  views: number
  isPinned: boolean
  createdAt: string
}

interface ForumReply {
  _id: string
  content: string
  authorId: {
    _id: string
    name: string
    email: string
    avatarUrl?: string
  }
  upvotes: any[]
  downvotes: any[]
  isSolution: boolean
  createdAt: string
}

export default function ForumPostPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const postId = params?.id as string

  const [post, setPost] = useState<ForumPost | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [replyContent, setReplyContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!postId) return

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/forum/posts/${postId}`)
        if (res.ok) {
          const data = await res.json()
          setPost(data.post)
          setReplies(data.replies || [])
        } else {
          setError("Post not found")
        }
      } catch (error) {
        console.error("Failed to fetch post", error)
        setError("Failed to load post")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!session || !post) return

    try {
      const res = await fetch(`/api/forum/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      })

      if (res.ok) {
        const data = await res.json()
        // Refetch the post to get updated vote arrays
        const postRes = await fetch(`/api/forum/posts/${postId}`)
        if (postRes.ok) {
          const postData = await postRes.json()
          setPost(postData.post)
        }
      }
    } catch (error) {
      console.error("Failed to vote", error)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !replyContent.trim()) return

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/forum/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: replyContent,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to post reply")
      }

      const newReply = await res.json()
      setReplies([...replies, newReply])
      setReplyContent("")
      if (post) {
        setPost({ ...post, replyCount: post.replyCount + 1 })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading discussion...</p>
        </div>
      </div>
    )
  }

  if (error && !post) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Link href="/forum">
              <Button>Back to Forum</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) return null

  const netVotes = post.upvotes.length - post.downvotes.length
  const userVotedUp = session && post.upvotes.some((v) => v.toString() === (session.user as any).id)
  const userVotedDown =
    session && post.downvotes.some((v) => v.toString() === (session.user as any).id)

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/forum"
            className="text-sm text-muted-foreground hover:text-foreground mb-4 block flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forum
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Post */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {post.isPinned && (
                    <Badge variant="default" className="text-xs">
                      Pinned
                    </Badge>
                  )}
                  {post.courseId && (
                    <Badge variant="outline" className="text-xs">
                      {post.courseId.title}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>By {post.authorId.name}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{post.views} views</span>
                  </div>
                </div>
              </div>

              {/* Votes */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleVote("upvote")}
                  className={`p-1 rounded hover:bg-muted transition-colors ${
                    userVotedUp ? "text-primary" : ""
                  }`}
                  disabled={!session}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <span className="font-semibold text-lg">{netVotes}</span>
                <button
                  onClick={() => handleVote("downvote")}
                  className={`p-1 rounded hover:bg-muted transition-colors ${
                    userVotedDown ? "text-destructive" : ""
                  }`}
                  disabled={!session}
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {post.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
            </h2>
          </div>

          {replies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
              </CardContent>
            </Card>
          ) : (
            replies.map((reply) => (
              <Card key={reply._id} className={reply.isSolution ? "border-primary" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{reply.authorId.name}</span>
                        {reply.isSolution && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Solution
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Reply Form */}
        {session ? (
          <Card>
            <CardHeader>
              <CardTitle>Post a Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReply} className="space-y-4">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                  required
                />
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={submitting || !replyContent.trim()}>
                  {submitting ? "Posting..." : "Post Reply"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Please log in to reply</p>
              <Link href="/auth/login">
                <Button>Log In</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
