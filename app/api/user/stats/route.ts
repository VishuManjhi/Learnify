import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import UserStats from "@/models/UserStats"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    let stats = await UserStats.findOne({ userId: (session.user as any).id })

    if (!stats) {
      // Create default stats if not exists
      stats = await UserStats.create({
        userId: (session.user as any).id,
        totalPoints: 0,
        currentLevel: 1,
      })
    }

    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 },
    )
  }
}
