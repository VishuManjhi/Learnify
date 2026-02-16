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
  FileText,
  TrendingUp,
  Award,
  Plus,
  CheckCircle2,
  Clock,
  BarChart3,
  Sparkles,
} from "lucide-react"

interface Course {
  _id: string
  title: string
  description: string
  isPublished: boolean
  createdAt: string
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
            (c: any) => c.teacherId._id === userId || c.teacherId === userId,
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
      <div className="min-h-svh bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const publishedPercentage = stats
    ? Math.round((stats.publishedCourses / stats.totalCourses) * 100) || 0
    : 0

  return (
    <div className="min-h-svh bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Welcome back, Teacher!
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Manage your courses, track student progress, and inspire learning
              </p>
            </div>
            <Link href="/teacher/courses/new">
              <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="w-5 h-5" />
                Create New Course
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Courses Card */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Courses
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>{stats.publishedCourses} published</span>
                    <Clock className="w-3 h-3 text-orange-500 ml-2" />
                    <span>{stats.draftCourses} drafts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Students Card */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Students
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{stats.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalEnrollments} total enrollments
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Total Lessons Card */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Lessons
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{stats.totalLessons}</p>
                  <p className="text-xs text-muted-foreground">
                    Across {stats.totalCourses} courses
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Publishing Rate Card */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Publishing Rate
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{publishedPercentage}%</p>
                  <Progress value={publishedPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {stats.publishedCourses} of {stats.totalCourses} published
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              My Courses
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <Users className="w-4 h-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <GraduationCap className="w-6 h-6 text-primary" />
                      Your Courses
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {courses.length} {courses.length === 1 ? "course" : "courses"} created
                    </CardDescription>
                  </div>
                  <Link href="/teacher/courses/new">
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Course
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">No courses yet</p>
                      <p className="text-muted-foreground">
                        Create your first course to start teaching and engaging students
                      </p>
                    </div>
                    <Link href="/teacher/courses/new">
                      <Button size="lg" className="gap-2 mt-4">
                        <Plus className="w-5 h-5" />
                        Create Your First Course
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <Link
                        key={course._id}
                        href={`/teacher/courses/${course._id}`}
                        className="group"
                      >
                        <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer border-2 group-hover:scale-[1.02]">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                                  {course.title}
                                </CardTitle>
                              </div>
                              <Badge
                                variant={course.isPublished ? "default" : "secondary"}
                                className="shrink-0"
                              >
                                {course.isPublished ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Published
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Draft
                                  </>
                                )}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                              <Award className="w-3 h-3" />
                              <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Your Students
                </CardTitle>
                <CardDescription>
                  {students.length === 0
                    ? "No students enrolled in your courses yet."
                    : `${students.length} unique ${students.length === 1 ? "student" : "students"} enrolled in your courses`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-10 h-10 text-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">No students yet</p>
                      <p className="text-muted-foreground">
                        Once students enroll in your courses, they will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <Card
                        key={student.studentId}
                        className="border hover:border-primary/50 transition-all hover:shadow-md"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{student.name}</h4>
                                  <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <Badge variant="outline" className="gap-1">
                                <BookOpen className="w-3 h-3" />
                                {student.courses.length}{" "}
                                {student.courses.length === 1 ? "course" : "courses"}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
                                {student.courses.map((c) => c.title).join(", ")}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Analytics & Insights
                </CardTitle>
                <CardDescription>
                  Track your teaching performance and student engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {stats && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Course Completion Rate</span>
                          <span className="text-sm text-muted-foreground">
                            {publishedPercentage}%
                          </span>
                        </div>
                        <Progress value={publishedPercentage} className="h-3" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Student Engagement</span>
                          <span className="text-sm text-muted-foreground">
                            {stats.totalEnrollments} enrollments
                          </span>
                        </div>
                        <Progress
                          value={
                            stats.totalCourses > 0
                              ? Math.min((stats.totalEnrollments / (stats.totalCourses * 10)) * 100, 100)
                              : 0
                          }
                          className="h-3"
                        />
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Detailed analytics and charts coming soon. Track student progress, quiz
                      performance, and course engagement metrics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
