import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import connectToDatabase from "@/lib/db"
import Course from "@/models/Course"
import Lesson from "@/models/Lesson"
import Enrollment from "@/models/Enrollment"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { EnrollStudentsForm } from "@/components/teacher/enroll-students-form"

import { Badge } from "@/components/ui/badge"
import { BookOpen, ArrowLeft, Zap, Layers, Trophy, ShieldCheck, Plus, Settings, Users, ArrowUpRight } from "lucide-react"

export default async function TeacherCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!user) {
    redirect("/auth/login")
  }

  await connectToDatabase()

  // Fetch course
  const course = await Course.findOne({ _id: id, teacherId: user.id })

  if (!course) {
    redirect("/dashboard")
  }

  // Fetch lessons
  const lessons = await Lesson.find({ courseId: id }).sort({ orderIndex: 1 })

  // Fetch enrollments
  const enrollments = await Enrollment.find({ courseId: id }).populate("studentId", "name email")

  return (
    <div className="min-h-svh bg-[#030014] text-white pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.03] backdrop-blur-3xl py-12 px-4 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400/60 hover:text-blue-400 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Command Nexus
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="rounded-full border-blue-500/20 text-blue-400 bg-blue-500/5 px-4 py-1 font-black tracking-widest uppercase text-[9px]">
                  Course Manager
                </Badge>
                <Badge className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${course.isPublished ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`}>
                  {course.isPublished ? "ACTIVE STATUS" : "STAGING MODE"}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
                {course.title}
              </h1>
              <p className="text-blue-100/70 text-lg font-semibold tracking-tight max-w-2xl">
                {course.description}
              </p>
            </div>
            <div className="flex gap-4">
              <Link href={`/teacher/courses/${id}/lessons/new`}>
                <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 group">
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-500" />
                  Add Lesson
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <Tabs defaultValue="lessons" className="space-y-12">
          <div className="flex items-center justify-center">
            <TabsList className="bg-[#0a0b25]/90 backdrop-blur-2xl border border-white/10 p-1.5 rounded-[20px] h-14">
              <TabsTrigger value="lessons" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest px-10 h-full transition-all flex gap-2">
                <Layers className="w-3.5 h-3.5" />
                Lessons ({lessons?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="students" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest px-10 h-full transition-all flex gap-2">
                <Users className="w-3.5 h-3.5" />
                Linked Students ({enrollments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest px-10 h-full transition-all flex gap-2">
                <Settings className="w-3.5 h-3.5" />
                Core Config
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="lessons" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="bg-[#0a0b25]/60 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
              <CardHeader className="p-12 border-b border-white/10 bg-white/[0.02]">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">Lesson Database</CardTitle>
                    <CardDescription className="text-blue-100/40 font-black uppercase tracking-widest text-[10px]">Managing training protocols for this course</CardDescription>
                  </div>
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <BookOpen className="w-7 h-7 text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {lessons && lessons.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {lessons.map((lesson: any, index: number) => (
                      <div
                        key={lesson._id.toString()}
                        className="flex items-center justify-between p-10 hover:bg-blue-600/[0.02] transition-all group duration-500"
                      >
                        <div className="flex items-center gap-10">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black italic shadow-lg group-hover:rotate-6 transition-transform">
                            {index + 1}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xl font-black italic tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-3">
                              <Zap className="w-3 h-3 text-white/10" />
                              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                Processing Time: {lesson.durationMinutes} min
                              </p>
                            </div>
                          </div>
                        </div>
                        <Link href={`/teacher/courses/${id}/lessons/${lesson._id.toString()}/quiz`}>
                          <Button variant="outline" className="h-11 rounded-xl border-white/10 text-white/40 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 font-black uppercase tracking-widest text-[9px] gap-2">
                            Quiz Editor
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-32 text-center text-blue-100/20 font-black italic uppercase tracking-[0.3em] flex flex-col items-center gap-6">
                    <ShieldCheck className="w-16 h-16 opacity-10" />
                    Zero Lessons Created. Initiate course setup protocol.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="bg-[#0a0b25]/60 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
              <CardHeader className="p-12 border-b border-white/10 bg-white/[0.02]">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">Student Registry</CardTitle>
                    <CardDescription className="text-blue-100/40 font-black uppercase tracking-widest text-[10px]">Unauthorized links will be purged from the collective</CardDescription>
                  </div>
                  <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                    <Users className="w-7 h-7 text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-12">
                <div className="space-y-12">
                  <div className="bg-[#030014]/50 p-8 rounded-[32px] border border-white/5">
                    <EnrollStudentsForm courseId={id} />
                  </div>

                  {enrollments && enrollments.length > 0 ? (
                    <div className="divide-y divide-white/10 border-t border-white/10">
                      {enrollments.map((enrollment: any) => (
                        <div
                          key={enrollment._id.toString()}
                          className="flex items-center justify-between p-8 hover:bg-blue-600/[0.02] rounded-2xl transition-all group"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:border-blue-500/30 transition-all">
                              <Users className="w-5 h-5 text-white/20 group-hover:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-lg font-black italic uppercase tracking-tight text-white">{enrollment.studentId?.name || "Neural Ghost"}</h4>
                              <p className="text-xs text-blue-200/40 font-bold uppercase tracking-widest">{enrollment.studentId?.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10 mb-1">LINK ESTABLISHED</p>
                            <span className="text-[9px] font-black text-blue-200/30 uppercase tracking-widest">
                              SYNC: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-20 text-center text-blue-100/20 font-black italic uppercase tracking-[0.3em]">
                      Population scan: NULL.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="bg-[#0a0b25]/60 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
              <CardHeader className="p-12 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <Settings className="w-6 h-6 text-blue-400" />
                  <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Core Config</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-20 text-center">
                <div className="space-y-6">
                  <Trophy className="w-16 h-16 text-blue-500/10 mx-auto" />
                  <p className="text-blue-100/20 font-black italic uppercase tracking-[0.3em]">Protocol Overrides Pending Instructor Approval.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

