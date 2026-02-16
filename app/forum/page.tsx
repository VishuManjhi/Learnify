"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { MessageSquare, Plus, TrendingUp, Clock, Eye, ArrowUp, ArrowDown } from "lucide-react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
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
      <div className="min-h-svh bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading forum...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <MessageSquare className="w-8 h-8 text-primary" />
                Community Forum
              </h1>
              <p className="text-muted-foreground">
                Connect with fellow students, ask questions, and share knowledge
              </p>
            </div>
            {session && (
              <Link href="/forum/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Discussion
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {/* Pinned Posts */}
          {pinnedPosts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Pinned Discussions
              </h2>
              {pinnedPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Regular Posts */}
          <div className="space-y-3">
            {pinnedPosts.length > 0 && (
              <h2 className="text-lg font-semibold mt-6">All Discussions</h2>
            )}
            {regularPosts.length === 0 && pinnedPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No discussions yet</p>
                  {session && (
                    <Link href="/forum/new">
                      <Button>Start the first discussion</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              regularPosts.map((post) => <PostCard key={post._id} post={post} />)
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
    <Link href={`/forum/${post._id}`}>
      <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Votes */}
            <div className="flex flex-col items-center gap-1 min-w-[50px]">
              <ArrowUp className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-sm">{netVotes}</span>
              <ArrowDown className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
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
                  <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <span>By {post.authorId.name}</span>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{post.replyCount} replies</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{post.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
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
