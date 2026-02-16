"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  BookOpen,
  Users,
  GraduationCap,
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  BarChart3,
  ShieldCheck,
  ArrowUpRight,
  MoreVertical,
  Calendar,
  Layers,
  Cpu
} from "lucide-react"

interface Course {
  _id: string
  title: string
  description: string
  isPublished: boolean
  createdAt: string
  teacherId: any
}

interface TeacherStudent {
  studentId: string
  name: string
  email: string
  courses: { courseId: string; title: string }[]
}

interface TeacherStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalStudents: number
  totalEnrollments: number
  totalLessons: number
}

export function TeacherDashboard({ userId }: { userId: string }) {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<TeacherStudent[]>([])
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, studentsRes, statsRes] = await Promise.all([
          fetch("/api/courses?published=false"),
          fetch("/api/teacher/students"),
          fetch("/api/teacher/stats"),
        ])

        if (coursesRes.ok) {
          const data = await coursesRes.json()
          const myCourses = data.filter(
            (c: any) => (c.teacherId?._id || c.teacherId) === userId,
          )
          setCourses(myCourses)
        }

        if (studentsRes.ok) {
          const studentData = await studentsRes.json()
          setStudents(studentData)
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchData()
    }
  }, [userId, session])

  if (loading) {
    return (
      <div className="min-h-svh bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <ShieldCheck className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-blue-200/80 font-black tracking-[0.3em] uppercase text-xs">Synchronizing Management Console</p>
        </div>
      </div>
    )
  }

  const publishedPercentage = stats
    ? Math.round((stats.publishedCourses / stats.totalCourses) * 100) || 0
    : 0

  return (
    <div className="min-h-svh bg-[#030014] text-white pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Hero Management Header */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.03] backdrop-blur-3xl py-12 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20 rounded-full font-black tracking-widest text-[10px] uppercase">
                  <ShieldCheck className="w-3 h-3 mr-2 fill-blue-400" />
                  Teacher Management Authority
                </Badge>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                  TEACHER DASHBOARD:{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {session?.user?.name?.toUpperCase() || "INSTRUCTOR"}
                  </span>
                </h1>
                <p className="text-blue-100/70 text-lg font-semibold tracking-tight">
                  Monitoring student progress. <span className="text-blue-400">The platform awaits your guidance.</span>
                </p>
              </div>
            </div>

            {/* Nexus Leadership Card */}
            <div className="bg-[#0a0b25]/80 backdrop-blur-2xl p-6 rounded-[32px] border border-blue-500/30 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] min-w-[300px] relative group hover:border-blue-400/50 transition-all duration-500">
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:rotate-12 transition-transform">
                <Cpu className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] text-blue-300/50 font-black uppercase tracking-[0.2em] mb-1">Teaching Capacity</p>
                  <p className="text-3xl font-black italic tracking-tighter text-white">RANK S-CLASS</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-blue-300/50 font-black uppercase tracking-[0.2em] mb-1">Influence</p>
                  <p className="text-sm font-black text-blue-400">{stats?.totalEnrollments || 0} <span className="text-[10px] text-white/40 ml-1">Lessons</span></p>
                </div>
              </div>
              <div className="relative">
                <Progress value={publishedPercentage} className="h-2.5 bg-white/10" />
                <div className="absolute inset-0 bg-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Analytics Snapshot cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <NexusTeacherCard
              label="Active Courses"
              value={stats.totalCourses}
              subValue={`${stats.publishedCourses} LIVE / ${stats.draftCourses} DRAFT`}
              icon={<BookOpen className="w-7 h-7" />}
              color="blue"
            />
            <NexusTeacherCard
              label="Student Population"
              value={stats.totalStudents}
              subValue={`${stats.totalEnrollments} total enrollments`}
              icon={<Users className="w-7 h-7" />}
              color="cyan"
            />
            <NexusTeacherCard
              label="Lessons Created"
              value={stats.totalLessons}
              subValue={`Across ${stats.totalCourses} courses`}
              icon={<Layers className="w-7 h-7" />}
              color="purple"
            />
            <NexusTeacherCard
              label="Efficiency Score"
              value={`${publishedPercentage}%`}
              subValue="Course readiness index"
              icon={<TrendingUp className="w-7 h-7" />}
              color="rose"
              progress={publishedPercentage}
            />
          </div>
        )}

        {/* Workspace Management */}
        <Tabs defaultValue="courses" className="space-y-12">
          <div className="flex items-center justify-between bg-[#0a0b25]/90 backdrop-blur-2xl border border-blue-500/20 rounded-[28px] p-2 shadow-3xl sticky top-4 z-40">
            <TabsList className="bg-transparent h-14 w-full md:w-auto grid grid-cols-4 md:flex gap-1.5">
              <TabsTrigger value="courses" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white px-10 font-black uppercase tracking-widest text-[10px] transition-all">
                Courses
              </TabsTrigger>
              <TabsTrigger value="students" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white px-10 font-black uppercase tracking-widest text-[10px] transition-all">
                Students
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white px-10 font-black uppercase tracking-widest text-[10px] transition-all">
                Analytics
              </TabsTrigger>
              <TabsTrigger asChild value="forum" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white px-10 font-black uppercase tracking-widest text-[10px] transition-all">
                <Link href="/forum">Feed</Link>
              </TabsTrigger>
            </TabsList>
            <div className="hidden md:flex gap-2 pr-2">
              <Link href="/teacher/courses/new">
                <Button variant="outline" className="rounded-xl border-blue-500/10 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30 text-blue-400 font-bold text-xs uppercase tracking-widest gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Course
                </Button>
              </Link>
            </div>
          </div>

          <TabsContent value="courses" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                <GraduationCap className="w-8 h-8 text-blue-500" />
                My Courses
              </h3>
              <Badge variant="outline" className="px-5 py-1.5 font-black text-[10px] uppercase tracking-widest border-blue-500/30 text-blue-300 bg-blue-500/5">{courses.length} Identified</Badge>
            </div>

            {courses.length === 0 ? (
              <Card className="rounded-[50px] border-2 border-dashed border-blue-500/10 py-32 text-center bg-white/[0.02]">
                <div className="space-y-8">
                  <div className="w-28 h-28 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto border border-blue-500/10">
                    <BookOpen className="w-14 h-14 text-blue-500/20" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-4xl font-black italic tracking-tighter uppercase">Course database is empty</h4>
                    <p className="text-blue-100/70 max-w-sm mx-auto font-semibold text-lg leading-relaxed">
                      Initialize your teaching core by crafting your first specialized course module.
                    </p>
                  </div>
                  <Link href="/teacher/courses/new">
                    <Button size="lg" className="rounded-[20px] h-16 px-12 bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 transition-all hover:scale-105">
                      Initialize Training
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <Link key={course._id} href={`/teacher/courses/${course._id}`} className="group">
                    <Card className="h-full bg-[#0a0b25]/60 backdrop-blur-xl border-white/10 rounded-[36px] overflow-hidden hover:border-blue-400/50 hover:shadow-[0_0_50px_-15px_rgba(59,130,246,0.4)] transition-all duration-500 hover:-translate-y-2">
                      <CardHeader className="p-10 pb-4">
                        <div className="flex justify-between items-start mb-6">
                          <div className={`p-4 rounded-2xl ${course.isPublished ? "bg-cyan-500/10 text-cyan-400" : "bg-orange-500/10 text-orange-400"} border border-current opacity-40 group-hover:opacity-100 transition-opacity`}>
                            {course.isPublished ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                          </div>
                          <Badge
                            className={`rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest ${course.isPublished ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`}
                          >
                            {course.isPublished ? "Active Nexus" : "Staging Area"}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl font-black leading-[1.1] italic tracking-tight group-hover:text-blue-400 transition-colors uppercase">
                          {course.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-10 pb-10 flex flex-col justify-between grow">
                        <p className="text-blue-100/70 font-semibold text-sm line-clamp-3 mb-8 min-h-[60px] leading-relaxed">
                          {course.description}
                        </p>
                        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-blue-500/40" />
                            <span className="text-[9px] uppercase font-black text-blue-100/50 tracking-widest leading-none">
                              Sync: {new Date(course.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="w-11 h-11 rounded-full border border-blue-500/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                            <ArrowUpRight className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="students" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="rounded-[40px] border border-white/10 shadow-3xl overflow-hidden bg-[#0a0b25]/60 backdrop-blur-xl">
              <CardHeader className="bg-blue-600/[0.05] border-b border-white/10 p-12 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-white">Student Registry</CardTitle>
                  <CardDescription className="text-lg font-semibold text-blue-100/60 tracking-tight">Managing enrolled students for your courses.</CardDescription>
                </div>
                <div className="bg-blue-600/10 px-8 py-4 rounded-[20px] border border-blue-600/20 shadow-inner">
                  <span className="text-lg font-black text-blue-400 uppercase tracking-[0.2em]">{students.length} Total</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {students.length === 0 ? (
                  <div className="p-32 text-center text-blue-200/10 font-black italic uppercase tracking-[0.3em]">
                    Population scan results: NULL. Enrollments pending.
                  </div>
                ) : (
                  <div className="divide-y divide-white/10 border-t border-white/10">
                    {students.map((student) => (
                      <div key={student.studentId} className="flex items-center justify-between p-10 hover:bg-blue-600/[0.02] transition-colors group">
                        <div className="flex items-center gap-8">
                          <div className="w-18 h-18 rounded-[24px] bg-[#030014] flex items-center justify-center border border-white/10 group-hover:border-blue-500/40 group-hover:rotate-6 transition-all duration-500">
                            <Users className="w-8 h-8 text-blue-500/40 group-hover:text-blue-400" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-2xl font-black tracking-tight text-white uppercase italic">{student.name}</h4>
                            <p className="text-sm text-blue-200/40 font-bold uppercase tracking-widest">{student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/10 mb-2">Connected Training</p>
                            <div className="flex gap-2 flex-wrap justify-end">
                              {student.courses.map((c, i) => (
                                <Badge key={i} variant="secondary" className="bg-blue-500/10 text-blue-300 border-blue-500/10 rounded-lg py-0.5 px-3 text-[9px] font-black uppercase tracking-widest">
                                  {c.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/5">
                            <MoreVertical className="w-6 h-6 text-white/20" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid lg:grid-cols-2 gap-10">
              <Card className="rounded-[50px] border border-white/10 shadow-3xl bg-[#0a0b25]/60 backdrop-blur-xl overflow-hidden">
                <CardHeader className="p-12 border-b border-white/10">
                  <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                    <BarChart3 className="w-8 h-8 text-blue-400" />
                    Course Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-12 space-y-12">
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/60 mb-2">Publishing Progress</p>
                        <p className="text-4xl font-black italic tracking-tighter text-white">{publishedPercentage}% <span className="text-sm font-semibold text-blue-100/40 not-italic tracking-normal uppercase ml-2">Synced</span></p>
                      </div>
                      <Badge className="bg-cyan-500/10 text-cyan-400 font-extrabold tracking-widest px-4 py-1.5 rounded-full border border-cyan-500/20 uppercase text-[9px]">+12% GROWTH</Badge>
                    </div>
                    <div className="relative">
                      <Progress value={publishedPercentage} className="h-4 bg-white/10" />
                      <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-20" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/60 mb-2">Enrollment Count</p>
                        <p className="text-4xl font-black italic tracking-tighter text-white">{stats?.totalEnrollments || 0} <span className="text-sm font-semibold text-blue-100/40 not-italic tracking-normal uppercase ml-2">Requests</span></p>
                      </div>
                      <Badge className="bg-blue-500/10 text-blue-400 font-extrabold tracking-widest px-4 py-1.5 rounded-full border border-blue-500/20 uppercase text-[9px]">Stable Link</Badge>
                    </div>
                    <div className="relative">
                      <Progress value={Math.min(((stats?.totalEnrollments || 0) / 50) * 100, 100)} className="h-4 bg-white/10" />
                      <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[50px] border-none shadow-3xl bg-blue-600/[0.05] border border-blue-500/10 group overflow-hidden">
                <div className="w-full h-full p-14 flex flex-col justify-center text-center space-y-10 relative">
                  <div className="absolute inset-0 bg-[#0a0b1e]/10 backdrop-blur-3xl z-0" />
                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto shadow-2xl border border-blue-500/20 group-hover:scale-110 transition-transform duration-700">
                      <Cpu className="w-12 h-12 text-blue-500" />
                    </div>
                    <div className="space-y-4 mt-8">
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Advanced Analytics</h3>
                      <p className="text-blue-100/60 font-semibold max-w-xs mx-auto text-lg leading-relaxed tracking-tight">
                        Predictive student modeling and real-time heatmap synthesis coming online soon.
                      </p>
                    </div>
                    <div className="mt-10">
                      <Badge className="bg-blue-600 text-white font-black tracking-[0.3em] px-8 py-3 rounded-2xl shadow-2xl shadow-blue-600/40 uppercase text-[10px] animate-pulse">Offline</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function NexusTeacherCard({
  label,
  value,
  subValue,
  icon,
  color,
  progress
}: {
  label: string;
  value: string | number;
  subValue: string;
  icon: React.ReactNode;
  color: string;
  progress?: number;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/20 border-blue-500/30 shadow-blue-500/5",
    cyan: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30 shadow-cyan-500/5",
    purple: "text-purple-400 bg-purple-500/20 border-purple-500/30 shadow-purple-500/5",
    rose: "text-rose-400 bg-rose-500/20 border-rose-500/30 shadow-rose-500/5",
  }

  return (
    <Card className="bg-[#0a0b25]/80 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 rounded-[32px] overflow-hidden group hover:border-blue-400/50 hover:-translate-y-1">
      <div className={`absolute top-0 right-0 p-10 opacity-5 transition-transform duration-700 group-hover:scale-125 group-hover:opacity-10 ${colorMap[color].split(' ')[0]}`}>
        {icon}
      </div>
      <CardHeader className="p-10 pb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">{label}</p>
        <CardTitle className="text-6xl font-black italic tracking-tighter tabular-nums mb-3 text-white uppercase group-hover:text-blue-400 transition-colors">
          {value}
        </CardTitle>
        <CardDescription className="text-xs font-black text-blue-100/60 uppercase tracking-widest leading-none h-4">
          {subValue}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-10 pb-10 pt-4">
        {progress !== undefined ? (
          <div className="relative">
            <Progress value={progress} className="h-2 bg-white/5" />
            <div className="absolute inset-0 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ) : (
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div className={`h-full w-2/3 bg-gradient-to-r opacity-20 ${colorMap[color].split(' ')[1]} blur-sm`} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
