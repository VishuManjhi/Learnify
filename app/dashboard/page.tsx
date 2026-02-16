import { redirect } from "next/navigation"
import { StudentDashboard } from "@/components/dashboard/student-dashboard"
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/login")
  } 

  const user = session.user as any

  return (
    <div>
      {user.role === "teacher" ? <TeacherDashboard userId={user.id} /> : <StudentDashboard userId={user.id} />}
    </div>
  )
}
