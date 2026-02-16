"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, TrendingUp, ShieldCheck, Zap } from "lucide-react"

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
    return (
      <div className="min-h-svh bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <ShieldCheck className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-blue-100/70 font-black tracking-[0.3em] uppercase text-xs">Loading Global Rankings...</p>
        </div>
      </div>
    )
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-yellow-500/10"
      case 2: return "bg-slate-300/10 text-slate-300 border-slate-300/20 shadow-slate-300/10"
      case 3: return "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-orange-500/10"
      default: return "bg-blue-500/5 text-blue-400 border-blue-500/10"
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5" />
      case 2: return <Medal className="w-5 h-5" />
      case 3: return <Trophy className="w-5 h-5" />
      default: return <span className="text-xs font-black">#{rank}</span>
    }
  }

  return (
    <div className="min-h-svh bg-[#030014] text-white pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.03] backdrop-blur-3xl py-16 px-4 shadow-2xl overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="rounded-full border-blue-500/20 text-blue-400 bg-blue-500/5 px-6 py-1.5 font-black tracking-[0.3em] uppercase text-[10px] animate-in fade-in slide-in-from-top-4 duration-700">
            Hall of Fame
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Global Rankings
          </h1>
          <p className="text-blue-100/70 text-xl font-semibold tracking-tight max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Behold the top students of the platform. Your journey to the top begins here.
          </p>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 relative z-10">
        <Card className="bg-[#0a0b25]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-3xl overflow-hidden">
          <CardHeader className="p-12 border-b border-white/10 bg-white/[0.02]">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">Top Learners</CardTitle>
                <CardDescription className="text-blue-100/60 font-black uppercase tracking-widest text-[10px]">Ranked by total study points</CardDescription>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/10">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.userId._id}
                  className="flex items-center justify-between p-10 hover:bg-blue-600/[0.02] transition-all group duration-500 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg transition-transform group-hover:rotate-6 duration-500 ${getRankStyle(entry.rank)}`}>
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <p className="text-2xl font-black tracking-tight text-white uppercase italic group-hover:text-blue-400 transition-colors">{entry.userId?.name || "Anonymous Learner"}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="border-white/10 text-blue-100/60 text-[9px] font-black uppercase tracking-widest px-2 py-0">
                          Level {entry.currentLevel}
                        </Badge>
                        <p className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em]">Rank Achieved</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-3xl font-black italic tracking-tighter text-blue-400 tabular-nums uppercase flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500 animate-pulse" />
                      {entry.totalPoints}
                      <span className="text-[10px] not-italic tracking-widest text-white/20 ml-1">XP</span>
                    </p>
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
