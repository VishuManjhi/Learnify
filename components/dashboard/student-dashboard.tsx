"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  Trophy,
  Zap,
  BookOpen,
  Target,
  Users,
  Crown,
  Flame,
  Sparkles,
  Search,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  Star,
  Activity,
  Award
} from "lucide-react"

interface UserStats {
  totalPoints: number
  currentLevel: number
  levelProgress: number
  lessonsCompleted: number
  quizzesCompleted: number
  coursesEnrolled: number
}

interface Course {
  _id: string
  title: string
  description: string
  teacherId: string
  imageUrl?: string
  category?: string
}

interface StudentQuiz {
  _id: string
  title: string
  description: string
  passingScore: number
  lessonId: string
  lessonTitle: string
  courseId: string
  courseTitle: string
  attempted: boolean
  passed: boolean
  lastScore: number | null
  lastPercentage: number | null
}

export function StudentDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, enrolledRes] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/student/courses"),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (enrolledRes.ok) {
          const enrolledData = await enrolledRes.json()
          setCourses(enrolledData.courses || [])
          setQuizzes(enrolledData.quizzes || [])
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
  }, [session])

  if (loading) {
    return (
      <div className="min-h-svh bg-[#030014] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <Activity className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-blue-200/80 font-black uppercase tracking-[0.3em] text-xs">Synchronizing Achievements</p>
        </div>
      </div>
    )
  }

  // Calculate level progress (assumes 1000 XP per level)
  const currentLevelXP = stats ? stats.totalPoints % 1000 : 0
  const xpPercentage = (currentLevelXP / 1000) * 100

  return (
    <div className="min-h-svh bg-[#030014] text-white pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Hero Header Section */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.03] backdrop-blur-3xl py-12 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20 rounded-full font-black tracking-widest text-[10px] uppercase">
                  <Star className="w-3 h-3 mr-2 fill-blue-400" />
                  Elite Scholar Rank
                </Badge>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                  WELCOME BACK,{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {session?.user?.name?.toUpperCase() || "HERO"}
                  </span>
                </h1>
                <p className="text-blue-100/70 text-lg font-semibold tracking-tight">
                  Your journey through the academy continues. <span className="text-blue-400">Mastery is within reach.</span>
                </p>
              </div>
            </div>

            {/* Nexus Level Card */}
            <div className="bg-[#0a0b25]/80 backdrop-blur-2xl p-6 rounded-[32px] border border-blue-500/30 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] min-w-[300px] relative group hover:border-blue-400/50 transition-all duration-500">
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:rotate-12 transition-transform">
                <Trophy className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] text-blue-300/50 font-black uppercase tracking-[0.2em] mb-1">Current Standing</p>
                  <p className="text-3xl font-black italic tracking-tighter text-white">LEVEL {stats?.currentLevel || 1}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-blue-300/50 font-black uppercase tracking-[0.2em] mb-1">Progression</p>
                  <p className="text-sm font-black text-blue-400">{currentLevelXP} / 1000 <span className="text-[10px] text-white/40 ml-1">XP</span></p>
                </div>
              </div>
              <div className="relative">
                <Progress value={xpPercentage} className="h-2.5 bg-white/10" />
                <div className="absolute inset-0 bg-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-12">
          <NexusStatCard
            title="Nexus Points"
            value={stats?.totalPoints || 0}
            icon={<Zap className="w-6 h-6" />}
            color="blue"
          />
          <NexusStatCard
            title="Global Rank"
            value={`#${stats?.currentLevel || 1}`}
            icon={<Crown className="w-6 h-6" />}
            color="indigo"
          />
          <NexusStatCard
            title="Modules Cleared"
            value={stats?.lessonsCompleted || 0}
            icon={<BookOpen className="w-6 h-6" />}
            color="cyan"
          />
          <NexusStatCard
            title="Trials Won"
            value={stats?.quizzesCompleted || 0}
            icon={<Target className="w-6 h-6" />}
            color="purple"
          />
          <NexusStatCard
            title="Active Realms"
            value={stats?.coursesEnrolled || 0}
            icon={<Flame className="w-6 h-6" />}
            color="rose"
            className="col-span-2 md:col-span-1"
          />
        </div>

        {/* Workspace Hub */}
        <Tabs defaultValue="courses" className="space-y-10">
          <div className="flex items-center justify-between bg-[#0a0b25]/90 backdrop-blur-xl p-1.5 rounded-[24px] border border-blue-500/20 shadow-2xl sticky top-4 z-40">
            <TabsList className="bg-transparent h-12 w-full md:w-auto grid grid-cols-3 md:flex gap-1.5">
              <TabsTrigger value="courses" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest px-8 transition-all">
                Realms
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest px-8 transition-all">
                Trials
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest px-8 transition-all">
                Rankings
              </TabsTrigger>
            </TabsList>

            <div className="hidden md:flex gap-2 pr-2">
              <Link href="/courses">
                <Button variant="outline" className="rounded-xl border-blue-500/10 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30 text-blue-400 font-bold text-xs uppercase tracking-widest gap-2">
                  <Search className="w-4 h-4" />
                  Scan New Knowledge
                </Button>
              </Link>
            </div>
          </div>

          <TabsContent value="courses" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.length === 0 ? (
                <div className="col-span-full py-28 text-center space-y-6 bg-white/[0.02] rounded-[40px] border-2 border-dashed border-blue-500/10">
                  <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/10">
                    <GraduationCap className="w-12 h-12 text-blue-500/30" />
                  </div>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase">No Active Adventures</h3>
                  <p className="text-blue-100/70 max-w-sm mx-auto font-semibold">
                    The nexus is waiting for you to download your first course module.
                  </p>
                  <Link href="/courses">
                    <Button size="lg" className="rounded-2xl px-12 h-14 bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-blue-600/20">
                      Discovery Mode
                    </Button>
                  </Link>
                </div>
              ) : (
                courses.map((course) => (
                  <Link key={course._id} href={`/courses/${course._id}`}>
                    <Card className="group h-full bg-[#0a0b25]/60 backdrop-blur-md border-white/10 hover:border-blue-400/40 hover:shadow-[0_0_40px_-15px_rgba(59,130,246,0.5)] transition-all duration-500 rounded-[32px] overflow-hidden">
                      <div className="aspect-video bg-[#030014] relative overflow-hidden">
                        {course.imageUrl ? (
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-indigo-900/40 flex items-center justify-center">
                            <Sparkles className="w-16 h-16 text-blue-500/20" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-blue-600/80 backdrop-blur-md text-white border-none font-black text-[9px] px-3 py-1 uppercase tracking-widest rounded-lg">
                            {course.category || "General"}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-2xl font-black italic tracking-tight group-hover:text-blue-400 transition-colors uppercase leading-none">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-8 pb-8 flex flex-col justify-between grow">
                        <p className="text-blue-100/70 font-semibold text-sm line-clamp-2 min-h-[40px] leading-relaxed mb-6">{course.description}</p>
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:rotate-6 transition-transform">
                              <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-200/60 leading-none">Global Cohort</span>
                          </div>
                          <div className="w-10 h-10 rounded-full border border-blue-500/10 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                            <ChevronRight className="w-5 h-5 text-blue-500/50 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="rounded-[40px] border border-white/10 bg-[#0a0b25]/60 backdrop-blur-xl shadow-2xl overflow-hidden">
              <CardHeader className="bg-blue-600/[0.03] border-b border-white/5 p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                  <Target className="w-48 h-48 text-blue-400" />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-[28px] flex items-center justify-center border border-blue-500/20 shadow-inner">
                    <Award className="w-10 h-10 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-white">Trial Nexus</CardTitle>
                    <CardDescription className="text-lg font-semibold text-blue-100/60 tracking-tight">
                      {quizzes.length === 0
                        ? "Scan results negative. No challenges detected."
                        : `IDENTIFIED: ${quizzes.length} Knowledge Trials across your synchronized realms`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {quizzes.length === 0 ? (
                  <div className="p-24 text-center text-blue-200/20 font-black italic uppercase tracking-[0.2em]">
                    Pending Trial Manifestation...
                  </div>
                ) : (
                  <div className="divide-y divide-white/10 border-t border-white/10">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="flex items-center justify-between p-10 hover:bg-blue-600/[0.02] transition-colors group cursor-pointer"
                      >
                        <div className="space-y-2">
                          <h4 className="text-2xl font-black italic tracking-tight group-hover:text-blue-400 transition-colors uppercase">{quiz.title}</h4>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="rounded-full text-[9px] font-black uppercase tracking-widest py-0.5 px-3 border-blue-500/20 text-blue-400 bg-blue-500/5">
                              {quiz.courseTitle}
                            </Badge>
                            <span className="text-xs text-white/20 font-bold uppercase tracking-widest">Target: {quiz.lessonTitle}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className="text-right flex flex-col items-end">
                            {quiz.attempted ? (
                              <>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[10px] font-black uppercase text-white/10 tracking-[0.2em]">Mastery Level</span>
                                  <span className={`text-xl font-black italic ${quiz.passed ? "text-cyan-400" : "text-rose-500"}`}>
                                    {quiz.lastPercentage !== null ? `${quiz.lastPercentage.toFixed(0)}%` : "-"}
                                  </span>
                                </div>
                                <Badge className={`rounded-full shadow-lg text-[9px] font-black uppercase tracking-[0.2em] px-4 ${quiz.passed ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "bg-rose-500/10 text-rose-500 border-rose-500/30"}`}>
                                  {quiz.passed ? "Success" : "Failure"}
                                </Badge>
                              </>
                            ) : (
                              <Badge className="bg-blue-600/10 text-blue-400 border-blue-500/20 rounded-full shadow-lg text-[9px] font-black uppercase tracking-widest px-4 py-1 animate-pulse">
                                Unchallenged
                              </Badge>
                            )}
                          </div>
                          <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                            <ChevronRight className="w-6 h-6 text-white/10 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Simplified */}
          <TabsContent value="leaderboard" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="rounded-[50px] border border-white/10 bg-[#0a0b25]/60 backdrop-blur-xl py-28 text-center shadow-3xl">
              <div className="space-y-10">
                <div className="relative inline-block">
                  <div className="absolute -inset-6 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
                  <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white/10">
                    <TrendingUp className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">Global Ranking</h3>
                  <p className="text-blue-100/60 text-xl font-semibold max-w-md mx-auto tracking-tight">
                    Measure your intelligence against the top-tier scholars of the Nexus.
                  </p>
                </div>
                <Link href="/leaderboard">
                  <Button size="lg" className="rounded-2xl px-16 h-16 text-lg font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/20 transition-all hover:scale-105">
                    Enter Ranking Nexus
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function NexusStatCard({
  title,
  value,
  icon,
  color,
  className
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  className?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/20 border-blue-500/30 shadow-blue-500/5",
    indigo: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30 shadow-indigo-500/5",
    cyan: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30 shadow-cyan-500/5",
    purple: "text-purple-400 bg-purple-500/20 border-purple-500/30 shadow-purple-500/5",
    rose: "text-rose-400 bg-rose-500/20 border-rose-500/30 shadow-rose-500/5",
  }

  return (
    <Card className={`bg-[#0a0b25]/80 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 rounded-[28px] overflow-hidden group hover:border-blue-400/50 hover:-translate-y-1 ${className}`}>
      <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 whitespace-nowrap">{title}</CardTitle>
        <div className={`p-2.5 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${colorMap[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <p className="text-4xl font-black italic tracking-tighter tabular-nums text-white group-hover:text-blue-400 transition-colors uppercase">{value}</p>
      </CardContent>
    </Card>
  )
}
