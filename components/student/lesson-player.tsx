"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface LessonPlayerProps {
  courseId: string
  lessonId: string
  title: string
  content: string
  durationMinutes: number
}

interface QuizQuestion {
  _id: string
  questionText: string
  questionType: "multiple_choice" | "short_answer" | "true_false"
  options?: { _id: string; text: string; isCorrect: boolean }[]
}

interface Quiz {
  _id: string
  title: string
  description?: string
  questions: QuizQuestion[]
  passingScore: number
}

export function LessonPlayer({ courseId, lessonId, title, content, durationMinutes }: LessonPlayerProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loadingQuiz, setLoadingQuiz] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadQuiz = async () => {
      setLoadingQuiz(true)
      try {
        const res = await fetch(`/api/quizzes?lesson_id=${lessonId}`)
        if (res.ok) {
          const data = await res.json()
          setQuiz(data[0] ?? null) // assume at most one quiz per lesson
        } else {
          setQuiz(null)
        }
      } catch {
        setQuiz(null)
      } finally {
        setLoadingQuiz(false)
      }
    }

    loadQuiz()
  }, [lessonId])

  const handleOptionChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmitQuiz = async () => {
    if (!quiz) return

    setSubmitting(true)
    setStatusMessage(null)

    try {
      const res = await fetch("/api/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id: quiz._id, answers }),
      })

      const result = await res.json()
      if (!res.ok) {
        setStatusMessage(result.error || "Failed to submit quiz")
        setSubmitting(false)
        return
      }

      if (result.passed) {
        // Mark lesson complete and award points
        const progressRes = await fetch(`/api/lessons/${lessonId}/progress`, {
          method: "POST",
        })

        if (progressRes.ok) {
          setStatusMessage("✅ Quiz passed! Lesson completed and points awarded.")
        } else {
          setStatusMessage("Quiz passed, but failed to mark lesson complete.")
        }
      } else {
        setStatusMessage("❌ Quiz not passed. Review the lesson and try again.")
      }
    } catch (error) {
      setStatusMessage("An error occurred while submitting the quiz.")
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question: QuizQuestion) => {
    if (question.questionType === "multiple_choice" || question.questionType === "true_false") {
      return (
        <div className="space-y-2" key={question._id}>
          <p className="font-medium">{question.questionText}</p>
          <div className="space-y-1">
            {question.options?.map((opt) => (
              <label key={opt._id} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={question._id}
                  value={opt._id}
                  checked={answers[question._id] === opt._id}
                  onChange={(e) => handleOptionChange(question._id, e.target.value)}
                />
                <span>{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      )
    }

    // basic short-answer handling
    return (
      <div className="space-y-2" key={question._id}>
        <p className="font-medium">{question.questionText}</p>
        <Textarea
          value={answers[question._id] || ""}
          onChange={(e) => handleOptionChange(question._id, e.target.value)}
          rows={2}
        />
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-1">{title}</h1>
          <p className="text-muted-foreground text-sm">
            Course lesson • ~{durationMinutes || 30} min
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{content}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lesson Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingQuiz ? (
              <p className="text-muted-foreground text-sm">Loading quiz...</p>
            ) : !quiz ? (
              <p className="text-muted-foreground text-sm">
                Your instructor hasn&apos;t added a quiz for this lesson yet. You can&apos;t
                finish this lesson until a quiz is available.
              </p>
            ) : (
              <>
                {quiz.description && (
                  <p className="text-muted-foreground text-sm mb-2">{quiz.description}</p>
                )}

                <div className="space-y-4">
                  {quiz.questions.map((q) => renderQuestion(q))}
                </div>

                <Button onClick={handleSubmitQuiz} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Quiz & Finish Lesson"}
                </Button>
              </>
            )}

            {statusMessage && (
              <p className="text-sm mt-2">
                {statusMessage}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

