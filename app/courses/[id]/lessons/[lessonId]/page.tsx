import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/db"
import Lesson from "@/models/Lesson"
import Course from "@/models/Course"
import Enrollment from "@/models/Enrollment"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LessonPlayer } from "@/components/student/lesson-player"

interface LessonPageProps {
  params: Promise<{ id: string; lessonId: string }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id, lessonId } = await params
  const courseId = id

  const session = await getServerSession(authOptions)
  const user = session?.user as any

  await connectToDatabase()

  const course = await Course.findById(courseId)
  if (!course) {
    redirect("/courses")
  }

  // Ensure user is enrolled (or is the teacher)
  let isEnrolled = false
  if (user) {
    if (course.teacherId.toString() === user.id) {
      isEnrolled = true
    } else {
      const enrollment = await Enrollment.findOne({
        courseId,
        studentId: user.id,
      })
      isEnrolled = !!enrollment
    }
  }

  if (!isEnrolled) {
    redirect(`/courses/${courseId}`)
  }

  const lesson = await Lesson.findById(lessonId)
  if (!lesson || lesson.courseId.toString() !== courseId) {
    redirect(`/courses/${courseId}`)
  }

  return (
    <LessonPlayer
      courseId={courseId}
      lessonId={lessonId}
      title={lesson.title}
      content={lesson.content}
      durationMinutes={lesson.durationMinutes}
    />
  )
}

