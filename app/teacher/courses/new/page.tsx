"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Sparkles, BookOpen, ArrowLeft, Zap, Layers, Trophy } from "lucide-react"

export default function NewCoursePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("general")
  const [difficulty, setDifficulty] = useState("intermediate")
  const [pointsPerLesson, setPointsPerLesson] = useState("10")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty_level: difficulty,
          points_per_lesson: Number(pointsPerLesson) || 10,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create course")
      }

      const course = await response.json()
      router.push(`/teacher/courses/${course._id}`)
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
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.03] backdrop-blur-3xl py-12 px-4 shadow-2xl">
        <div className="max-w-5xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400/60 hover:text-blue-400 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Command Nexus
          </Link>
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full border-blue-500/20 text-blue-400 bg-blue-500/5 px-4 py-1 font-black tracking-widest uppercase text-[9px]">
              Course Initialization
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-tight">
              Forge New <span className="text-blue-400">Knowledge Course</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-4 py-16 relative z-10">
        <Card className="bg-[#0a0b25]/80 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-3xl overflow-hidden">
          <CardHeader className="p-12 border-b border-white/10 bg-white/[0.02]">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">Course Parameters</CardTitle>
                <CardDescription className="text-blue-100/60 font-black uppercase tracking-widest text-[10px]">Define the core configuration of your training module</CardDescription>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-8">
                <div className="grid gap-3">
                  <Label htmlFor="title" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Course Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., QUANTUM JAVASCRIPT ARCHITECTURE"
                    className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all h-14 text-white placeholder:text-white/20 rounded-2xl px-6"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="description" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Conceptual Brief
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the knowledge transfer protocol..."
                    className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 focus:ring-blue-400/20 transition-all text-white placeholder:text-white/20 rounded-2xl p-6 min-h-[140px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="grid gap-3">
                    <Label htmlFor="category" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Domain
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 h-14 text-white rounded-2xl px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0b25] border-white/20 text-white">
                        <SelectItem value="general">GENERAL</SelectItem>
                        <SelectItem value="programming">PROGRAMMING</SelectItem>
                        <SelectItem value="design">DESIGN</SelectItem>
                        <SelectItem value="business">BUSINESS</SelectItem>
                        <SelectItem value="languages">LANGUAGES</SelectItem>
                        <SelectItem value="science">SCIENCE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="difficulty" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Intensity
                    </Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger id="difficulty" className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 h-14 text-white rounded-2xl px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0b25] border-white/20 text-white">
                        <SelectItem value="beginner">BEGINNER</SelectItem>
                        <SelectItem value="intermediate">INTERMEDIATE</SelectItem>
                        <SelectItem value="advanced">ADVANCED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="pointsPerLesson" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Synchronization Reward (XP)
                  </Label>
                  <Input
                    id="pointsPerLesson"
                    type="number"
                    min={1}
                    className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 h-14 text-white rounded-2xl px-6"
                    value={pointsPerLesson}
                    onChange={(e) => setPointsPerLesson(e.target.value)}
                  />
                  <p className="text-[10px] text-blue-100/40 font-black uppercase tracking-widest ml-1">
                    Points awarded per base-lesson synchronization.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl text-center">
                  ERR: {error.toUpperCase()}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="grow h-16 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 group"
                >
                  {loading ? "INITIALIZING..." : (
                    <div className="flex items-center gap-2">
                      CREATE COURSE
                      <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
                <Link href="/dashboard" className="hidden sm:block">
                  <Button type="button" variant="outline" className="h-16 px-10 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest">
                    ABORT
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
