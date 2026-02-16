"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Target,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

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
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null)

  useEffect(() => {
    const loadQuiz = async () => {
      setLoadingQuiz(true)
      try {
        const res = await fetch(`/api/quizzes?lesson_id=${lessonId}`)
        if (res.ok) {
          const data = await res.json()
          setQuiz(data[0] ?? null)
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
        setStatusMessage({ text: result.error || "Failed to submit quiz", success: false })
        setSubmitting(false)
        return
      }

      if (result.passed) {
        const progressRes = await fetch(`/api/lessons/${lessonId}/progress`, {
          method: "POST",
        })

        if (progressRes.ok) {
          setStatusMessage({ text: "✅ LESSON COMPLETE: Progress saved. Points awarded.", success: true })
        } else {
          setStatusMessage({ text: "Quiz passed, but failed to synchronize progress.", success: false })
        }
      } else {
        setStatusMessage({ text: "❌ QUIZ FAILED: Score below passing threshold. Please review the lesson.", success: false })
      }
    } catch (error) {
      setStatusMessage({ text: "Critical error during submission.", success: false })
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const isAnswered = !!answers[question._id];

    if (question.questionType === "multiple_choice" || question.questionType === "true_false") {
      return (
        <Card key={question._id} className="bg-white/[0.04] border-white/10 rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-all">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic border transition-all ${isAnswered ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white/40"}`}>
                {index + 1}
              </div>
              <p className="text-xl font-black italic uppercase tracking-tight text-white">{question.questionText}</p>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-3">
            {question.options?.map((opt) => {
              const checked = answers[question._id] === opt._id;
              return (
                <label
                  key={opt._id}
                  className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${checked
                    ? "bg-blue-600/20 border-blue-500 text-white shadow-[0_0_20px_-10px_rgba(59,130,246,0.5)]"
                    : "bg-white/[0.03] border-white/10 text-blue-100/40 hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${checked ? "border-blue-400 bg-blue-400" : "border-white/10"}`}>
                    {checked && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                  </div>
                  <input
                    type="radio"
                    className="hidden"
                    name={question._id}
                    value={opt._id}
                    checked={checked}
                    onChange={(e) => handleOptionChange(question._id, e.target.value)}
                  />
                  <span className="font-bold uppercase tracking-wide text-sm">{opt.text}</span>
                </label>
              );
            })}
          </CardContent>
        </Card>
      )
    }

    return (
      <Card key={question._id} className="bg-white/[0.04] border-white/10 rounded-3xl overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic border transition-all ${isAnswered ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white/40"}`}>
              {index + 1}
            </div>
            <p className="text-xl font-black italic uppercase tracking-tight text-white">{question.questionText}</p>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Textarea
            value={answers[question._id] || ""}
            onChange={(e) => handleOptionChange(question._id, e.target.value)}
            placeholder="Enter your answer..."
            className="bg-[#030014]/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-2xl p-6 text-white placeholder:text-white/20 min-h-[120px]"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-svh bg-[#030014] text-white pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 border-b border-white/10 bg-white/[0.03] backdrop-blur-3xl py-12 px-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-3">
            <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400/60 hover:text-blue-400 transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Course
            </Link>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">{title}</h1>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-600/10 text-blue-400 border-blue-500/20 font-black tracking-widest uppercase text-[9px] px-3 py-1">
                Lesson Viewer
              </Badge>
              <div className="flex items-center gap-2 text-white/20">
                <Clock className="w-3.5 h-3.5" />
                <p className="text-[10px] font-black uppercase tracking-widest">Est. Time: {durationMinutes || 30} min</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0a0b25]/80 p-4 px-6 rounded-2xl border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none">Status: Connected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16 relative z-10">
        <Card className="bg-[#0a0b25]/60 backdrop-blur-xl border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
          <CardHeader className="p-12 pb-6 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Lesson Content</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-12">
            <p className="whitespace-pre-line text-lg font-semibold text-blue-100/70 leading-relaxed">
              {content}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-10">
          <div className="flex items-center gap-6">
            <div className="h-[2px] grow bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <div className="flex items-center gap-3 px-6 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 backdrop-blur-sm">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Quiz Required</span>
            </div>
            <div className="h-[2px] grow bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          </div>

          <Card className="bg-[#0a0b25]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-3xl overflow-hidden">
            <CardHeader className="p-12 bg-white/[0.03] border-b border-white/10">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Lesson Quiz</CardTitle>
                  <CardDescription className="text-blue-100/40 font-black uppercase tracking-widest text-[10px]">Complete the quiz to earn points and level up</CardDescription>
                </div>
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <Activity className="w-7 h-7 text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-12 space-y-10">
              {loadingQuiz ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic animate-pulse">Initializing Quiz Data...</p>
                </div>
              ) : !quiz ? (
                <div className="text-center py-20 space-y-6">
                  <HelpCircle className="w-16 h-16 text-white/5 mx-auto" />
                  <p className="text-blue-100/30 text-xl font-black italic uppercase tracking-widest max-w-sm mx-auto">
                    Quiz not available. Pending instructor update.
                  </p>
                </div>
              ) : (
                <>
                  {quiz.description && (
                    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                      <p className="text-blue-100/60 font-medium italic tracking-tight">{quiz.description}</p>
                    </div>
                  )}

                  <div className="space-y-8">
                    {quiz.questions.map((q, idx) => renderQuestion(q, idx))}
                  </div>

                  <div className="pt-10 space-y-8">
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                      className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-lg rounded-[24px] shadow-2xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 group"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                          SUBMITTING...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          SUBMIT QUIZ
                          <Zap className="w-6 h-6 group-hover:animate-pulse" />
                        </div>
                      )}
                    </Button>

                    {statusMessage && (
                      <div className={`p-8 rounded-[28px] border flex items-start gap-6 animate-in slide-in-from-top-4 duration-500 ${statusMessage.success
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}>
                        {statusMessage.success ? <CheckCircle2 className="w-8 h-8 shrink-0" /> : <XCircle className="w-8 h-8 shrink-0" />}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">Quiz Result Status</p>
                          <p className="text-lg font-black italic tracking-tight uppercase leading-none">{statusMessage.text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

