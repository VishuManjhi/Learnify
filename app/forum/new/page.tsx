"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewPostPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!session) {
    router.push("/auth/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags: tagArray,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create post")
      }

      const post = await response.json()
      router.push(`/forum/${post._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-[#030014] relative overflow-hidden pb-20">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.02] backdrop-blur-3xl py-12 px-4 shadow-2xl">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Cancel & Return to Forum
          </Link>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300">
              New Discussion
            </h1>
            <p className="text-blue-100/60 font-semibold max-w-xl text-lg leading-relaxed">
              Start a conversation with the community.
            </p>
          </div>
        </div>
      </div>

      {/* Discussion Details */}
      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <Card className="bg-[#0b0c2e] backdrop-blur-xl border-white/20 rounded-[40px] overflow-hidden shadow-2xl border-t-2 border-t-blue-500">
          <CardHeader className="p-10 pb-6">
            <CardTitle className="text-2xl font-black italic tracking-tight uppercase">Discussion Form</CardTitle>
            <CardDescription className="text-blue-200/60 font-bold uppercase tracking-widest text-xs pt-2">
              Ensure all fields are filled before posting.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-3">
                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80 pl-1">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="Primary objective of this transmission..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                  className="h-16 bg-black/40 border-white/20 rounded-2xl px-6 text-white font-semibold focus:border-blue-400/50 transition-all text-lg placeholder:text-blue-200/20"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="content" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80 pl-1">
                  Content
                </Label>
                <Textarea
                  id="content"
                  placeholder="Inject detailed transmission data here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  required
                  className="bg-black/40 border-white/20 rounded-2xl p-6 text-white font-semibold focus:border-blue-400/50 transition-all text-lg resize-none leading-relaxed placeholder:text-blue-200/20"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="tags" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80 pl-1">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
                  placeholder="e.g., protocol, sync-error, discovery"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="h-14 bg-black/40 border-white/20 rounded-2xl px-6 text-white font-semibold focus:border-blue-400/50 transition-all placeholder:text-blue-200/20"
                />
                <p className="text-[10px] text-blue-100/60 font-bold uppercase tracking-[0.1em] pl-1">
                  Tags help others find your post.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest rounded-xl">
                  Transmission Error: {error}
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-blue-600/20"
                >
                  {loading ? "Creating Discussion..." : "Create Post"}
                </Button>
                <Link href="/forum">
                  <Button type="button" variant="outline" className="h-16 px-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-black uppercase tracking-widest transition-all">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
