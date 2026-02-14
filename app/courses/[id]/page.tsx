import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    <div className="min-h-svh bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground mb-4 block">
            ← Back to Courses
          </Link>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-muted-foreground mb-4">By {course.teacherId?.name || "Unknown Instructor"}</p>
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
              <Button type="submit">Enroll Now</Button>
            </form>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{course.description}</p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Difficulty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="capitalize">{course.difficultyLevel || "Intermediate"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{course.category || "General"}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>{lessons?.length || 0} lessons</CardDescription>
              </CardHeader>
              <CardContent>
                {lessons && lessons.length > 0 ? (
                  <div className="space-y-3">
                    {lessons.map((lesson: any, index: number) => (
                      <Link key={lesson._id.toString()} href={isEnrolled ? `/courses/${id}/lessons/${lesson._id.toString()}` : "#"}>
                        <div
                          className={`p-4 border rounded-lg hover:border-primary transition-colors ${isEnrolled ? "cursor-pointer" : ""
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{lesson.title}</h4>
                              <p className="text-sm text-muted-foreground">{lesson.durationMinutes} min</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No lessons yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
