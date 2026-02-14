import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import User from "@/models/User"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user as any).role !== "admin") {
      // Allow for now if no admin exists? No, strict.
      // But verify 'role' on session user object.
      // If I didn't seed an admin, no one can access this.
      // That's fine for now.
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    const query: any = {}
    if (role) {
      query.role = role
    }

    const users = await User.find(query).select("-password")

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch users" },
      { status: 500 },
    )
  }
}
