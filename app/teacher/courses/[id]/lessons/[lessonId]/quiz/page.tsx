"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface CsvQuestionError {
  line: number
  message: string
}

function parseCsvQuestions(csv: string): { questions: any[]; errors: CsvQuestionError[] } {
  const lines = csv
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const questions: any[] = []
  const errors: CsvQuestionError[] = []

  lines.forEach((line, index) => {
    const parts = line.split(",").map((p) => p.trim())
    if (parts.length < 6) {
      errors.push({
        line: index + 1,
        message: "Expected at least 6 columns: question, optionA, optionB, optionC, optionD, correctLetter",
      })
      return
    }

    const [questionText, optA, optB, optC, optD, correctRaw] = parts
    const correct = (correctRaw || "").toUpperCase()
    const validLetters = ["A", "B", "C", "D"]
    if (!validLetters.includes(correct)) {
      errors.push({
        line: index + 1,
        message: "Correct answer must be one of: A, B, C, D",
      })
      return
    }

    const options = [
      { text: optA, isCorrect: correct === "A" },
      { text: optB, isCorrect: correct === "B" },
      { text: optC, isCorrect: correct === "C" },
      { text: optD, isCorrect: correct === "D" },
    ]

    questions.push({
      questionText,
      questionType: "multiple_choice",
      points: 1,
      options,
    })
  })

  return { questions, errors }
}

export default function LessonQuizEditorPage() {
  const params = useParams<{ id: string; lessonId: string }>()
  const courseId = params?.id as string
  const lessonId = params?.lessonId as string
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [passingScore, setPassingScore] = useState("70")
  const [csv, setCsv] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasExistingQuiz, setHasExistingQuiz] = useState(false)

  useEffect(() => {
    const loadExistingQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes?lesson_id=${lessonId}`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            const quiz = data[0]
            setHasExistingQuiz(true)
            setTitle(quiz.title || "")
            setDescription(quiz.description || "")
            setPassingScore(String(quiz.passingScore || 70))
          }
        }
      } catch {
        // ignore load error, treat as no quiz
      } finally {
        setLoading(false)
      }
    }

    if (lessonId) {
      loadExistingQuiz()
    }
  }, [lessonId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const { questions, errors } = parseCsvQuestions(csv)
    if (errors.length > 0) {
      setError(
        "CSV has errors:\n" +
          errors.map((er) => `Line ${er.line}: ${er.message}`).join("\n"),
      )
      return
    }

    if (!title.trim()) {
      setError("Quiz title is required")
      return
    }

    if (questions.length === 0) {
      setError("Please provide at least one question in the CSV")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          title,
          description,
          passingScore: Number(passingScore) || 70,
          questions,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Failed to save quiz")
        return
      }

      setSuccess("Quiz saved successfully.")
      setHasExistingQuiz(true)
    } catch {
      setError("Failed to save quiz")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading quiz editor...</div>
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href={`/teacher/courses/${courseId}`}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold">Lesson Quiz</h1>
          <p className="text-muted-foreground">
            {hasExistingQuiz ? "Edit the quiz for this lesson." : "Create a quiz for this lesson so students can finish it."}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>
              Define the quiz title, passing score, and upload questions using a simple CSV format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-2 max-w-xs">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min={1}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="csv">Questions CSV</Label>
                <Textarea
                  id="csv"
                  value={csv}
                  onChange={(e) => setCsv(e.target.value)}
                  rows={8}
                  placeholder={
                    "One question per line, comma-separated:\n" +
                    "Question text, Option A, Option B, Option C, Option D, Correct letter (A-D)\n\n" +
                    'Example:\n' +
                    'What is 2+2?, 3, 4, 5, 6, B'
                  }
                />
                <p className="text-xs text-muted-foreground">
                  When you save, any existing quiz for this lesson will be replaced with the questions from this CSV.
                </p>
              </div>

              {error && (
                <div className="whitespace-pre-wrap p-3 bg-destructive/10 text-destructive text-sm rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-100 text-emerald-800 text-sm rounded">
                  {success}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Quiz"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/teacher/courses/${courseId}`)}
                >
                  Back to Course
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

