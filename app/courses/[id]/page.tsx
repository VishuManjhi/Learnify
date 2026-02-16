import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  ArrowLeft,
  User,
  Clock,
  BarChart,
  Layers,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Zap
} from "lucide-react"
import Link from "next/link"
import connectToDatabase from "@/lib/db"
import Course from "@/models/Course"
import Lesson from "@/models/Lesson"
import Enrollment from "@/models/Enrollment"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  await connectToDatabase()

  // Fetch course
  const course = await Course.findById(id).populate("teacherId", "name email")

  if (!course || (!course.isPublished && course.teacherId._id.toString() !== user?.id)) {
    redirect("/courses")
  }

  // Fetch lessons
  const lessons = await Lesson.find({ courseId: id }).sort({ orderIndex: 1 })

  // Check if user is enrolled
  let isEnrolled = false
  if (user) {
    const enrollment = await Enrollment.findOne({
      courseId: id,
      studentId: user.id,
    })
    isEnrolled = !!enrollment
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
          <Link href="/courses" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400/60 hover:text-blue-400 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Academy Database
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <Badge variant="outline" className="rounded-full border-blue-500/20 text-blue-400 bg-blue-500/5 px-4 py-1 font-black tracking-widest uppercase text-[9px]">
                Knowledge Realm Module
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-tight">
                {course.title}
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-xs font-bold text-blue-100/60">
                    Lead Instructor: <span className="text-white">{course.teacherId?.name || "Neural Network"}</span>
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-xs font-bold text-blue-100/60">
                    Sync Time: <span className="text-white">{(lessons?.length || 0) * 30}m Est.</span>
                  </p>
                </div>
              </div>
            </div>

            {user && !isEnrolled && (
              <form
                action={async () => {
                  "use server"
                  const session = await getServerSession(authOptions)
                  if (session && session.user) {
                    await connectToDatabase()
                    const existing = await Enrollment.findOne({ courseId: id, studentId: (session.user as any).id })
                    if (!existing) {
                      await Enrollment.create({
                        courseId: id,
                        studentId: (session.user as any).id,
                      })
                    }
                  }
                }}
              >
                <Button className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 group">
                  Initialize Sync
                  <Zap className="w-5 h-5 ml-2 group-hover:animate-pulse" />
                </Button>
              </form>
            )}
            {isEnrolled && (
              <Badge className="h-12 px-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-black uppercase tracking-widest text-[10px]">
                Synchronization Active
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 py-16 relative z-10">
        <Tabs defaultValue="overview" className="space-y-12">
          <div className="flex items-center justify-center">
            <TabsList className="bg-[#0a0b25]/90 backdrop-blur-2xl border border-white/10 p-1.5 rounded-[20px] h-14">
              <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest px-12 h-full transition-all">
                Overview
              </TabsTrigger>
              <TabsTrigger value="lessons" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest px-12 h-full transition-all">
                Modules
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-3 gap-8 text-left">
              <Card className="lg:col-span-2 bg-[#0a0b25]/60 backdrop-blur-xl border-white/10 rounded-[40px] overflow-hidden">
                <CardHeader className="p-10 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Realm Intel</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                  <p className="text-blue-100/70 font-semibold text-lg leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-[#0a0b25]/80 backdrop-blur-xl border-white/10 rounded-[32px] overflow-hidden group hover:border-blue-400/40 transition-all">
                  <CardHeader className="p-8 pb-3">
                    <div className="flex items-center gap-3">
                      <BarChart className="w-4 h-4 text-blue-400/60" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Complexity Level</p>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 pt-0">
                    <p className="text-3xl font-black italic uppercase tracking-tighter text-white group-hover:text-blue-400 transition-colors">
                      {course.difficultyLevel || "Staged"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0b25]/80 backdrop-blur-xl border-white/10 rounded-[32px] overflow-hidden group hover:border-blue-400/40 transition-all">
                  <CardHeader className="p-8 pb-3">
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-blue-400/60" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Knowledge Category</p>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 pt-0">
                    <p className="text-3xl font-black italic uppercase tracking-tighter text-white group-hover:text-blue-400 transition-colors">
                      {course.category || "General"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="bg-[#0a0b25]/60 backdrop-blur-xl border-white/10 rounded-[40px] overflow-hidden">
              <CardHeader className="p-12 border-b border-white/10 bg-white/[0.02]">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Lesson Nodes</CardTitle>
                    <CardDescription className="text-blue-100/40 font-black uppercase tracking-widest text-[10px]">
                      {lessons?.length || 0} Synchronized Modules Identified
                    </CardDescription>
                  </div>
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <PlayCircle className="w-7 h-7 text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {lessons && lessons.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {lessons.map((lesson: any, index: number) => (
                      <Link
                        key={lesson._id.toString()}
                        href={isEnrolled ? `/courses/${id}/lessons/${lesson._id.toString()}` : "#"}
                        className={`block group ${!isEnrolled && "opacity-50 cursor-not-allowed"}`}
                      >
                        <div className="flex items-center justify-between p-10 hover:bg-blue-600/[0.02] transition-all duration-500">
                          <div className="flex items-center gap-10">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black italic shadow-lg group-hover:rotate-6 transition-transform">
                              {index + 1}
                            </div>
                            <div className="space-y-1 text-left">
                              <h4 className="text-xl font-black italic tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-3">
                                <Clock className="w-3 h-3 text-white/10" />
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                  Access Period: ~{lesson.durationMinutes} min
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {!isEnrolled ? (
                              <ShieldCheck className="w-6 h-6 text-white/10" />
                            ) : (
                              <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-24 text-center space-y-4">
                    <BookOpen className="w-12 h-12 text-white/5 mx-auto" />
                    <p className="text-blue-100/20 font-black italic uppercase tracking-[0.2em]">Node Database Empty</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
