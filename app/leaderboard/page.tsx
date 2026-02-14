"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LeaderboardEntry {
  userId: { _id: string; name: string }
  totalPoints: number
  currentLevel: number
  rank: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard")
        if (res.ok) {
          const data = await res.json()
          setLeaderboard(
            data.map((entry: any, index: number) => ({
              ...entry,
              rank: index + 1,
            }))
          )
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return <div className="p-6">Loading leaderboard...</div>
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Global Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other learners</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Learners</CardTitle>
            <CardDescription>Ranked by total points earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-card transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      #{entry.rank}
                    </div>
                    <div>
                      <p className="font-medium">{entry.userId?.name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">Level {entry.currentLevel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{entry.totalPoints} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
