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
    <div className="min-h-svh bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground mb-4 block">
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-muted-foreground">{course.description}</p>
            </div>
            <span className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary whitespace-nowrap">
              {course.isPublished ? "Published" : "Draft"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="lessons" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lessons">Lessons ({lessons?.length || 0})</TabsTrigger>
            <TabsTrigger value="students">Students ({enrollments?.length || 0})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Course Lessons</CardTitle>
                  <CardDescription>Manage lessons and content</CardDescription>
                </div>
                <Link href={`/teacher/courses/${id}/lessons/new`}>
                  <Button>Add Lesson</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {lessons && lessons.length > 0 ? (
                  <div className="space-y-2">
                    {lessons.map((lesson: any, index: number) => (
                      <div
                        key={lesson._id.toString()}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-card transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            <p className="text-sm text-muted-foreground">{lesson.durationMinutes} min</p>
                          </div>
                        </div>
                        <Link href={`/teacher/courses/${id}/lessons/${lesson._id.toString()}/quiz`}>
                          <Button variant="outline" size="sm">
                            Edit Quiz
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No lessons yet. Create your first lesson to get started.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>{enrollments?.length || 0} students enrolled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <EnrollStudentsForm courseId={id} />

                  {enrollments && enrollments.length > 0 ? (
                    <div className="space-y-2">
                      {enrollments.map((enrollment: any) => (
                        <div
                          key={enrollment._id.toString()}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{enrollment.studentId?.name || "Unknown"}</h4>
                            <p className="text-sm text-muted-foreground">{enrollment.studentId?.email}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Joined {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No students enrolled yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>Configure course properties</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Course settings editor coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
