import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: List goodies for an event
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get("eventId");

        if (!eventId) {
            return NextResponse.json({ error: "eventId required" }, { status: 400 });
        }

        const logs = await prisma.goodieLog.findMany({
            where: { eventId },
            include: {
                participant: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
                givenByHost: { select: { name: true } },
            },
            orderBy: { givenAt: "desc" },
        });

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch goodies" }, { status: 500 });
    }
}

// POST: Record goodie distribution
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "HOST") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { participantId, eventId, item } = body;

        const log = await prisma.goodieLog.create({
            data: {
                participantId,
                eventId,
                item: item || "Goodie Pack",
                givenByHostId: (session.user as any).id,
            },
        });

        await prisma.participant.update({
            where: { id: participantId },
            data: { goodieReceived: true },
        });

        return NextResponse.json(log, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log goodie" }, { status: 500 });
    }
}
