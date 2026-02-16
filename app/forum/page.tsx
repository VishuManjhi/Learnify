"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { MessageSquare, Plus, TrendingUp, Clock, Eye, ArrowUp, ArrowDown, Zap, ShieldCheck } from "lucide-react"

interface ForumPost {
  _id: string
  title: string
  content: string
  authorId: {
    _id: string
    name: string
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

export default function ForumPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/forum/posts")
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts || [])
        }
      } catch (error) {
        console.error("Failed to fetch forum posts", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const pinnedPosts = filteredPosts.filter((p) => p.isPinned)
  const regularPosts = filteredPosts.filter((p) => !p.isPinned)

  if (loading) {
    return (
      <div className="min-h-svh bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Loading Discussions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#030014] relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.02] backdrop-blur-3xl py-12 px-4 shadow-2xl overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Community Forum</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300">
              Discussion Forum
            </h1>
            <p className="text-blue-100/60 font-semibold max-w-xl text-lg leading-relaxed">
              Connect with fellow students, start discussions, and share knowledge across the community.
            </p>
          </div>
          {session && (
            <Link href="/forum/new">
              <Button className="h-16 px-10 rounded-[24px] bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-blue-600/20 group">
                <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                New Discussion
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-xl group">
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Input
              placeholder="Search forum for specific topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-16 bg-[#0b0c2e] backdrop-blur-xl border-white/20 rounded-2xl text-lg font-semibold px-6 focus:border-blue-500/50 transition-all relative z-10 text-white placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-12">
          {/* Pinned Posts */}
          {pinnedPosts.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xs font-black italic tracking-[0.3em] uppercase text-blue-400/80 flex items-center gap-4">
                <TrendingUp className="w-4 h-4" />
                Pinned Discussions
                <div className="h-px bg-blue-500/20 flex-1" />
              </h2>
              <div className="space-y-4">
                {pinnedPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          <div className="space-y-6">
            {(pinnedPosts.length > 0 || searchQuery) && (
              <h2 className="text-xs font-black italic tracking-[0.3em] uppercase text-blue-100/40 flex items-center gap-4">
                <MessageSquare className="w-4 h-4" />
                Active Discussions
                <div className="h-px bg-white/5 flex-1" />
              </h2>
            )}

            {regularPosts.length === 0 && pinnedPosts.length === 0 ? (
              <Card className="rounded-[40px] border-2 border-dashed border-blue-500/10 py-32 text-center bg-white/[0.02]">
                <div className="space-y-8">
                  <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto border border-blue-500/10">
                    <MessageSquare className="w-12 h-12 text-blue-500/20" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase">No Discussions Yet</h3>
                    <p className="text-blue-100/50 max-w-sm mx-auto font-semibold">
                      No active discussions detected. Be the first to start a conversation.
                    </p>
                  </div>
                  {session && (
                    <Link href="/forum/new">
                      <Button size="lg" className="rounded-2xl px-10 h-14 bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-blue-600/20">
                        Start First Discussion
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {regularPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post }: { post: ForumPost }) {
  const netVotes = post.upvotes.length - post.downvotes.length

  return (
    <Link href={`/forum/${post._id}`} className="group block">
      <Card className="bg-[#0b0c2e] backdrop-blur-md border-white/20 hover:border-blue-400/60 hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.6)] transition-all duration-500 rounded-[32px] overflow-hidden">
        <CardContent className="p-8">
          <div className="flex gap-8">
            {/* Votes Hub */}
            <div className="flex flex-col items-center gap-2 min-w-[60px] p-2 rounded-2xl bg-white/10 border border-white/10 h-fit">
              <div className="p-1 rounded-lg hover:bg-blue-500/30 text-blue-300 transition-colors">
                <ArrowUp className="w-6 h-6" />
              </div>
              <span className="font-black italic text-xl tracking-tighter text-white">{netVotes}</span>
              <div className="p-1 rounded-lg hover:bg-rose-500/30 text-rose-300 transition-colors">
                <ArrowDown className="w-6 h-6" />
              </div>
            </div>

            {/* Discussion Details */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {post.isPinned && (
                      <Badge className="bg-blue-500 font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 border-none rounded-md text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <Zap className="w-3 h-3 mr-1.5 fill-current" />
                        Priority
                      </Badge>
                    )}
                    {post.courseId && (
                      <Badge variant="outline" className="border-blue-400/40 text-blue-200 bg-blue-500/10 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-md">
                        <ShieldCheck className="w-3 h-3 mr-1.5" />
                        {post.courseId.title}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-black italic tracking-tight text-white group-hover:text-blue-300 transition-colors uppercase leading-tight">
                    {post.title}
                  </h3>
                </div>
              </div>

              <p className="text-blue-100/80 font-semibold text-base line-clamp-2 leading-relaxed">
                {post.content}
              </p>

              {/* Tags Matrix */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map((tag, idx) => (
                    <Badge key={idx} className="bg-white/10 border-white/10 text-blue-100 text-[10px] uppercase font-black tracking-widest px-3 py-1 group-hover:bg-blue-500/20 group-hover:text-blue-200 transition-colors">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Discussion Information */}
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-blue-100/50">{post.authorId.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500/40" />
                  <span>{post.replyCount} Replies</span>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-blue-500/40" />
                  <span>{post.views} Views</span>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Clock className="w-3.5 h-3.5 text-blue-500/40" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
