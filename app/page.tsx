import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-svh">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Learnify</h1>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold text-balance">Learn, Achieve, Succeed</h2>
          <p className="text-xl text-muted-foreground text-balance">
            Learnify is a gamified learning management system that makes education engaging and rewarding. Teachers
            create courses, students learn and earn badges while climbing the leaderboard.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/sign-up">
              <Button size="lg">Join Now</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-card">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">Why Learnify?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Gamified Learning",
                description: "Earn points, unlock badges, and climb the leaderboard as you progress.",
              },
              {
                title: "Teacher Dashboard",
                description: "Create courses, manage lessons, build quizzes, and track student progress.",
              },
              {
                title: "Real-time Progress",
                description: "Track your learning journey with instant feedback and detailed analytics.",
              },
            ].map((feature, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6 bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-lg">
          <h3 className="text-3xl font-bold">Ready to Transform Learning?</h3>
          <p className="text-muted-foreground">Join thousands of students and teachers already using Learnify.</p>
          <Link href="/auth/sign-up">
            <Button size="lg">Get Started Free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Learnify. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
