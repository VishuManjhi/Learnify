import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Notification from "@/models/Notification"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const notifications = await Notification.find({ recipientId: (session.user as any).id })
      .sort({ createdAt: -1 })
      .limit(20)

    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch notifications" },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const body = await request.json()
    const { notificationId, read } = body

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: (session.user as any).id }, // Ensure ownership
      { read },
      { new: true }
    )

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json(notification)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update notification" },
      { status: 500 },
    )
  }
}
