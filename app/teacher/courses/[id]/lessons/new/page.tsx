"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ArrowLeft, Zap, Clock, ListOrdered, Share2 } from "lucide-react"

export default function NewLessonPage() {
  const params = useParams<{ id: string }>()
  const courseId = params?.id as string | undefined
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("30")
  const [orderIndex, setOrderIndex] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch existing lessons to determine next order index
  useEffect(() => {
    const fetchLessons = async () => {
      if (!courseId) return
      try {
        const res = await fetch(`/api/lessons?courseId=${courseId}`)
        if (res.ok) {
          const data = await res.json()
          setOrderIndex((data?.length || 0) + 1)
        }
      } catch {
        // Ignore ordering error; fallback to default
      }
    }

    fetchLessons()
  }, [courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId) {
      setError("Course ID is missing from the URL")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title,
          content,
          orderIndex,
          durationMinutes: Number(durationMinutes) || 30,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null as any)
        throw new Error(data?.error || "Failed to create lesson")
      }

      // On success, go back to the course page
      router.push(`/teacher/courses/${courseId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-[#030014] text-white pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.03] backdrop-blur-3xl py-12 px-4 shadow-2xl">
        <div className="max-w-5xl mx-auto">
          <Link href={`/teacher/courses/${courseId}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400/60 hover:text-blue-400 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Realm Controller
          </Link>
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full border-blue-500/20 text-blue-400 bg-blue-500/5 px-4 py-1 font-black tracking-widest uppercase text-[9px]">
              Protocol Manifestation
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
              Manifest <span className="text-blue-400">Knowledge Node</span>
            </h1>
            <p className="text-blue-100/60 text-lg font-semibold tracking-tight max-w-2xl">
              Initialize a new neural anchor for this realm. Define the synchronization parameters for your scholars.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-3xl mx-auto px-4 py-16 relative z-10">
        <Card className="bg-[#0a0b25]/80 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-3xl overflow-hidden">
          <CardHeader className="p-12 border-b border-white/10 bg-white/[0.02]">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">Node Identity</CardTitle>
                <CardDescription className="text-blue-100/40 font-black uppercase tracking-widest text-[10px]">Neural resonance settings</CardDescription>
              </div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
                <Zap className="w-7 h-7 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-8">
                <div className="grid gap-3">
                  <Label htmlFor="title" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Node Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., ASYNCHRONOUS DATA FLOWS"
                    className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all h-14 text-white placeholder:text-white/20 rounded-2xl px-6"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="grid gap-3">
                    <Label htmlFor="duration" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Sync Duration (Min)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 h-14 text-white rounded-2xl px-6"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="order" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <ListOrdered className="w-4 h-4" />
                      Nexus Position
                    </Label>
                    <Input
                      id="order"
                      type="number"
                      min={1}
                      className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 h-14 text-white rounded-2xl px-6"
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(Number(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="content" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Neural Data / Transmissions
                  </Label>
                  <Textarea
                    id="content"
                    placeholder={
                      "Inject knowledge links or protocol steps (one per line)...\nhttps://nexus.academy/core-vid\nhttps://nexus.academy/documentation"
                    }
                    className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all text-white placeholder:text-white/20 rounded-2xl p-6 min-h-[200px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl text-center">
                  MANIFESTATION ERROR: {error.toUpperCase()}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="grow h-16 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 group"
                >
                  {loading ? "MANIFESTING..." : (
                    <div className="flex items-center gap-2">
                      MANIFEST NODE
                      <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
                <Link href={`/teacher/courses/${courseId}`} className="hidden sm:block">
                  <Button type="button" variant="outline" className="h-16 px-10 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest">
                    PURGE
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

