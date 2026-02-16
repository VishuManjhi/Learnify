"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
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
  TrendingUp,
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
      <div className="min-h-svh bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Loading Discussion...</p>
        </div>
      </div>
    )
  }

  if (error && !post) {
    return (
      <div className="min-h-svh bg-[#030014] flex items-center justify-center">
        <Card className="max-w-md bg-[#0a0b25]/80 backdrop-blur-xl border-white/10 rounded-[32px]">
          <CardContent className="py-12 text-center">
            <p className="text-rose-400 font-bold uppercase tracking-widest mb-6">{error}</p>
            <Link href="/forum">
              <Button className="bg-blue-600 hover:bg-blue-500 font-bold uppercase tracking-widest rounded-xl">
                Return to Hub
              </Button>
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
    <div className="min-h-svh bg-[#030014] relative overflow-hidden pb-20">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.02] backdrop-blur-3xl py-8 px-4 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Forum
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 relative z-10">
        {/* Post Discussion */}
        <Card className="bg-[#0b0c2e] backdrop-blur-xl border-white/20 rounded-[40px] overflow-hidden shadow-2xl">
          <CardHeader className="p-10 pb-6">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {post.isPinned && (
                    <Badge className="bg-blue-600 font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 border-none rounded-md">
                      Pinned Discussion
                    </Badge>
                  )}
                  {post.courseId && (
                    <Badge variant="outline" className="border-blue-400/40 text-blue-200 bg-blue-500/10 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-md">
                      {post.courseId.title}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300">
                  {post.title}
                </CardTitle>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.15em] text-blue-200/60 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-blue-100/50">{post.authorId.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Posted: {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span>{post.views} Views</span>
                  </div>
                </div>
              </div>

              {/* Vote Controller */}
              <div className="flex flex-col items-center gap-2 min-w-[70px] p-2 rounded-[24px] bg-white/10 border border-white/10 h-fit shadow-xl">
                <button
                  onClick={() => handleVote("upvote")}
                  className={`p-2 rounded-xl hover:bg-blue-500/20 transition-all ${userVotedUp ? "text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-blue-500/10" : "text-white/20"
                    }`}
                  disabled={!session}
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
                <span className="font-black italic text-2xl tracking-tighter text-white py-1">{netVotes}</span>
                <button
                  onClick={() => handleVote("downvote")}
                  className={`p-2 rounded-xl hover:bg-rose-500/20 transition-all ${userVotedDown ? "text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] bg-rose-500/10" : "text-white/20"
                    }`}
                  disabled={!session}
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-8">
            <div className="h-px bg-white/10 w-full" />
            <div className="prose prose-invert max-w-none prose-p:text-blue-100/90 prose-p:font-semibold prose-p:text-lg prose-p:leading-relaxed">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Discussion Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-8 border-t border-white/10">
                {post.tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-white/10 border-white/20 text-blue-100 text-[10px] uppercase font-black tracking-widest px-4 py-1.5 hover:bg-blue-500/20 hover:text-blue-200 transition-colors cursor-default">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replies Feed */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-black italic tracking-[0.3em] uppercase text-blue-400/80 flex items-center gap-4 w-full">
              <MessageSquare className="w-4 h-4" />
              Discussion Thread ({replies.length})
              <div className="h-px bg-blue-500/20 flex-1" />
            </h2>
          </div>

          {replies.length === 0 ? (
            <Card className="rounded-[40px] border-2 border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
              <MessageSquare className="w-16 h-16 text-blue-400/20 mx-auto mb-6" />
              <p className="text-blue-200/40 font-bold uppercase tracking-widest text-sm">Waiting for replies...</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {replies.map((reply) => (
                <Card key={reply._id} className={`bg-[#0a0b25] backdrop-blur-md border border-white/20 rounded-[32px] overflow-hidden transition-all duration-500 hover:border-blue-500/40 ${reply.isSolution ? "border-blue-500/60 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)] bg-blue-700/[0.05]" : ""}`}>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-black text-[10px] text-blue-300">
                              {reply.authorId.name.charAt(0)}
                            </div>
                            <span className="font-black italic text-sm uppercase tracking-tight text-white">{reply.authorId.name}</span>
                            {reply.isSolution && (
                              <Badge className="bg-blue-500 font-black text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 border-none rounded-md text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse">
                                Verified Sync
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-200/30">
                            Sync: {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-blue-100/80 font-semibold text-base leading-relaxed whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        {session ? (
          <Card className="bg-[#0b0c2e] backdrop-blur-xl border border-blue-500/40 rounded-[40px] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                <Reply className="w-6 h-6 text-blue-500" />
                Post your Reply
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <form onSubmit={handleReply} className="space-y-6">
                <Textarea
                  placeholder="Write your reply here..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                  required
                  className="bg-black/40 border-white/20 rounded-2xl p-6 text-white placeholder:text-blue-200/20 focus:border-blue-400/50 transition-all font-semibold resize-none text-lg"
                />
                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest rounded-xl">
                    Injection Error: {error}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-blue-600/30 text-white"
                >
                  {submitting ? "Posting Reply..." : "Post Reply"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#0b0c2e] backdrop-blur-xl border border-white/20 rounded-[40px] p-12 text-center">
            <p className="text-blue-100/60 font-black uppercase tracking-widest text-sm mb-6">Please log in to participate in the discussion</p>
            <Link href="/auth/login">
              <Button className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-blue-600/20">
                Establish Link (Login)
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
