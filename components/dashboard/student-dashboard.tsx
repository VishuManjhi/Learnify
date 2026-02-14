"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useSession } from "next-auth/react"

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

export function StudentDashboard({ userId }: { userId: string }) {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user stats
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
    return <div className="p-6">Loading...</div>
  }

  const xpToNextLevel = stats ? stats.currentLevel * 1000 : 1000

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Keep learning and climbing the leaderboard</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalPoints || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.currentLevel || 1}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.lessonsCompleted || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.quizzesCompleted || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.coursesEnrolled || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="quizzes">My Quizzes</TabsTrigger>
            <TabsTrigger value="browse">Browse Courses</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Courses</CardTitle>
                <CardDescription>{courses.length} courses</CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <p className="text-muted-foreground">You haven&apos;t enrolled in any courses yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {courses.map((course) => (
                      <Link key={course._id} href={`/courses/${course._id}`}>
                        <Card className="hover:border-primary transition-colors cursor-pointer">
                          <CardHeader>
                            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>My Quizzes</CardTitle>
                <CardDescription>
                  {quizzes.length === 0
                    ? "No quizzes available yet for your enrolled courses."
                    : `${quizzes.length} quizzes across your courses`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quizzes.length === 0 ? (
                  <p className="text-muted-foreground">
                    When your instructors add quizzes to your lessons, they will appear here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{quiz.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {quiz.courseTitle} • {quiz.lessonTitle}
                          </p>
                        </div>
                        <div className="text-right">
                          {quiz.attempted ? (
                            <>
                              <p className="text-xs text-muted-foreground">
                                Last score:{" "}
                                {quiz.lastPercentage !== null
                                  ? `${quiz.lastPercentage.toFixed(0)}%`
                                  : "-"}
                              </p>
                              <p className="text-xs font-medium">
                                {quiz.passed ? "Passed" : "Not passed yet"}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs font-medium text-primary">Not attempted</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="browse">
            <Card>
              <CardHeader>
                <CardTitle>Explore Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/courses">
                  <Button>Browse All Courses</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Global Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/leaderboard">
                  <Button>View Full Leaderboard</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
