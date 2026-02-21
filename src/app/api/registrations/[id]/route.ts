import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE: Remove a registration and all related data
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "HOST") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const registrationId = params.id;

        // Get all participant IDs for this registration
        const participants = await prisma.participant.findMany({
            where: { registrationId },
            select: { id: true },
        });
        const participantIds = participants.map((p) => p.id);

        if (participantIds.length > 0) {
            // Delete goodie logs for these participants
            await prisma.goodieLog.deleteMany({
                where: { participantId: { in: participantIds } },
            });

            // Delete networking matches for these participants
            await prisma.networkingMatch.deleteMany({
                where: {
                    OR: [
                        { participant1Id: { in: participantIds } },
                        { participant2Id: { in: participantIds } },
                    ],
                },
            });

            // Delete participants
            await prisma.participant.deleteMany({
                where: { registrationId },
            });
        }

        // Delete submissions for this registration
        await prisma.submission.deleteMany({
            where: { registrationId },
        });

        // Delete the registration itself
        await prisma.registration.delete({
            where: { id: registrationId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete registration error:", error);
        return NextResponse.json(
            { error: "Failed to delete registration" },
            { status: 500 }
        );
    }
}
