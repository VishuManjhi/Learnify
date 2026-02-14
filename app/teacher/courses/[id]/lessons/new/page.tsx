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
    <div className="min-h-svh bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href={`/teacher/courses/${courseId}`}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold">Add New Lesson</h1>
          <p className="text-muted-foreground">
            Create a new lesson for this course. You can add text, links, or any learning
            resources in the content field.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
            <CardDescription>Define the title, duration, and content for this lesson.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Lesson Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to HTML"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="order">Order in Course</Label>
                  <Input
                    id="order"
                    type="number"
                    min={1}
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Content / Links</Label>
                <Textarea
                  id="content"
                  placeholder={
                    "Add lesson notes, instructions, or links (one per line), e.g.\nhttps://example.com/video\nhttps://example.com/article"
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Lesson"}
                </Button>
                <Link href={`/teacher/courses/${courseId}`}>
                  <Button type="button" variant="outline">
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

