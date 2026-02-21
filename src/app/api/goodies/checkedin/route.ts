import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: List all checked-in participants for an event
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "HOST") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get("eventId");

        if (!eventId) {
            return NextResponse.json({ error: "eventId required" }, { status: 400 });
        }

        // Get all participants who are checked in (isPresent = true) for this event
        const participants = await prisma.participant.findMany({
            where: {
                isPresent: true,
                registration: {
                    eventId,
                    status: "APPROVED",
                },
            },
            include: {
                user: {
                    select: { name: true, email: true, image: true },
                },
                registration: {
                    select: { teamName: true, status: true },
                },
                goodieLogs: {
                    select: { item: true, givenAt: true },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        return NextResponse.json(participants);
    } catch (error) {
        console.error("Fetch checked-in participants error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
