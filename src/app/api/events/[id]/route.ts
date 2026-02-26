import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE: Remove an event and all related data
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "HOST") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const eventId = params.id;

        // Verify the event belongs to this host
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event || event.hostId !== (session.user as any).id) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Get all registrations for this event
        const registrations = await prisma.registration.findMany({
            where: { eventId },
            select: { id: true },
        });
        const registrationIds = registrations.map((r) => r.id);

        // Get all participants for these registrations
        const participants = await prisma.participant.findMany({
            where: { registrationId: { in: registrationIds } },
            select: { id: true },
        });
        const participantIds = participants.map((p) => p.id);

        // Delete in order: goodie logs → networking matches → participants → submissions → registrations → announcements → photos → judge assignments → event
        if (participantIds.length > 0) {
            await prisma.goodieLog.deleteMany({ where: { eventId } });
            await prisma.networkingMatch.deleteMany({ where: { eventId } });
            await prisma.participant.deleteMany({
                where: { registrationId: { in: registrationIds } },
            });
        }

        // Delete submissions and their scores
        const submissions = await prisma.submission.findMany({
            where: { eventId },
            select: { id: true },
        });
        if (submissions.length > 0) {
            await prisma.score.deleteMany({
                where: { submissionId: { in: submissions.map((s) => s.id) } },
            });
            await prisma.submission.deleteMany({ where: { eventId } });
        }

        await prisma.registration.deleteMany({ where: { eventId } });
        await prisma.announcement.deleteMany({ where: { eventId } });
        await prisma.eventPhoto.deleteMany({ where: { eventId } });
        await prisma.judgeAssignment.deleteMany({ where: { eventId } });

        // Finally, delete the event itself
        await prisma.event.delete({ where: { id: eventId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete event error:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
