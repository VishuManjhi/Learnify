import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import UserStats from "@/models/UserStats"
import User from "@/models/User" // Ensure User model is registered

export async function GET() {
  try {
    await connectToDatabase()

    const leaderboard = await UserStats.find()
      .populate("userId", "name avatarUrl")
      .sort({ totalPoints: -1 })
      .limit(50)

    // Map to flatten structure if frontend expects it
    const formatted = leaderboard.map((stat: any) => ({
      ...stat.toObject(),
      profiles: stat.userId // Supabase likely returned 'profiles' joined
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch leaderboard" },
      { status: 500 },
    )
  }
}
