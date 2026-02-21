import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "HOST") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const participantId = params.id;
        const body = await request.json();
        const { action } = body; // "checkin" or "checkout"

        const participant = await prisma.participant.update({
            where: { id: participantId },
            data: { isPresent: action === "checkin" },
            include: {
                user: { select: { name: true, email: true } },
                registration: { select: { teamName: true, status: true } },
            },
        });

        return NextResponse.json({ success: true, participant });
    } catch (error) {
        console.error("Check-in error:", error);
        return NextResponse.json({ error: "Failed to update check-in" }, { status: 500 });
    }
}
