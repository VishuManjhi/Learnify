"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, ArrowLeft, BrainCircuit, ShieldCheck, Zap, Database, Terminal } from "lucide-react"

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
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        "DIAGNOSTIC ERRORS DETECTED:\n" +
        errors.map((er) => `Protocol Line ${er.line}: ${er.message}`).join("\n"),
      )
      return
    }

    if (!title.trim()) {
      setError("TRIAL TITLE IS MANDATORY")
      return
    }

    if (questions.length === 0) {
      setError("STATION REQUIRES AT LEAST ONE VALID TEST CASE")
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
        setError(data?.error || "SYNCHRONIZATION FAILURE")
        return
      }

      setSuccess("TRIAL PROTOCOL ESTABLISHED SUCCESSFULLY.")
      setHasExistingQuiz(true)
    } catch {
      setError("CRITICAL UPLOAD ERROR")
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith(".csv") && !file.type.includes("csv")) {
      setError("INVALID DATA STREAM (.CSV REQUIRED)")
      return
    }

    setUploadedFileName(file.name)
    setError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) {
        setCsv(text)
        setSuccess(`REMOTE DATA "${file.name}" INJECTED. VERIFY CORE SECTORS BELOW.`)
      }
    }
    reader.onerror = () => {
      setError("FAILED TO READ DATA STREAM.")
      setUploadedFileName(null)
    }
    reader.readAsText(file)
  }

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setUploadedFileName(null)
    setCsv("")
    setSuccess(null)
  }

  if (loading) {
    return (
      <div className="min-h-svh bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <Terminal className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-blue-200/80 font-black tracking-[0.3em] uppercase text-xs">Accessing Quiz Data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#030014] text-white pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.03] backdrop-blur-3xl py-12 px-4 shadow-2xl">
        <div className="max-w-5xl mx-auto">
          <Link href={`/teacher/courses/${courseId}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400/60 hover:text-blue-400 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Course Manager
          </Link>
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full border-blue-500/20 text-blue-400 bg-blue-500/5 px-4 py-1 font-black tracking-widest uppercase text-[9px]">
              Quiz Configuration
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
              Configure <span className="text-blue-400">Lesson Quiz</span>
            </h1>
            <p className="text-blue-100/60 text-lg font-semibold tracking-tight max-w-2xl">
              {hasExistingQuiz ? "Adjusting the assessment protocol for this lesson." : "Calibrating a new assessment terminal for student verification."}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 relative z-10">
        <Card className="bg-[#0a0b25]/80 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-3xl overflow-hidden">
          <CardHeader className="p-12 border-b border-white/10 bg-white/[0.02]">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">Quiz Parameters</CardTitle>
                <CardDescription className="text-blue-100/40 font-black uppercase tracking-widest text-[10px]">Learning assessment settings</CardDescription>
              </div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
                <BrainCircuit className="w-7 h-7 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="grid gap-3">
                    <Label htmlFor="title" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Quiz Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., QUANTUM LOGIC DIAGNOSTIC"
                      className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 h-14 text-white placeholder:text-white/20 rounded-2xl px-6"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="description" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      Briefing (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Calibration notes for scholars..."
                      className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 text-white placeholder:text-white/20 rounded-2xl p-6 min-h-[120px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="passingScore" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Passing Score (%)
                    </Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min={1}
                      max={100}
                      className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 h-14 text-white rounded-2xl px-6 w-full max-w-[200px]"
                      value={passingScore}
                      onChange={(e) => setPassingScore(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="csv" className="text-blue-100/90 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Question Data (CSV)
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,text/csv"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="csv-upload"
                        />
                        <Label
                          htmlFor="csv-upload"
                          className="cursor-pointer flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-white/10 rounded-xl hover:bg-white/5 transition-all text-blue-400"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Inject File
                        </Label>
                      </div>
                    </div>

                    {uploadedFileName && (
                      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{uploadedFileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="hover:text-rose-400 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <Textarea
                      id="csv"
                      value={csv}
                      onChange={(e) => {
                        setCsv(e.target.value)
                        if (uploadedFileName) {
                          setUploadedFileName(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ""
                          }
                        }
                      }}
                      className="bg-[#030014]/50 border-white/20 focus:border-blue-400/50 text-white placeholder:text-white/20 rounded-2xl p-6 min-h-[300px] font-mono text-xs leading-relaxed"
                      placeholder={
                        "MATRIX SYNTAX:\nQuestion text, Opt A, Opt B, Opt C, Opt D, Correct [A-D]\n\nExample:\nWhat is 2+2?, 3, 4, 5, 6, B"
                      }
                    />
                    <div className="p-6 bg-blue-500/5 border border-white/5 rounded-2xl space-y-3">
                      <p className="text-[10px] text-blue-100/40 font-black uppercase tracking-[0.1em] leading-relaxed">
                        NOTICE: Saving will overwrite any existing quiz for this lesson.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="whitespace-pre-wrap p-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl shadow-inner">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold rounded-2xl shadow-inner animate-pulse">
                  {success}
                </div>
              )}

              <div className="flex gap-4 pt-10">
                <Button
                  type="submit"
                  disabled={saving}
                  className="grow h-16 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 flex gap-2"
                >
                  {saving ? "INITIALIZING DATA..." : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Save Quiz
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-16 px-10 border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest"
                  onClick={() => router.push(`/teacher/courses/${courseId}`)}
                >
                  Abort
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

