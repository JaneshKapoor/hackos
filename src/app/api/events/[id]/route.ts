import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Fetch a single event by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "HOST") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const event = await prisma.event.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: { registrations: true, submissions: true },
                },
            },
        });

        if (!event || event.hostId !== (session.user as any).id) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error("Fetch event error:", error);
        return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}

// PUT: Update an event
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "HOST") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const event = await prisma.event.findUnique({
            where: { id: params.id },
        });

        if (!event || event.hostId !== (session.user as any).id) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const body = await request.json();
        const {
            title, description, location, startDate, endDate,
            maxTeamSize, requiresApproval, isPublished, submissionsOpen,
            registrationDeadline, submissionOpenAt, submissionDeadline,
        } = body;

        const updated = await prisma.event.update({
            where: { id: params.id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(location !== undefined && { location }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(maxTeamSize !== undefined && { maxTeamSize }),
                ...(requiresApproval !== undefined && { requiresApproval }),
                ...(isPublished !== undefined && { isPublished }),
                ...(submissionsOpen !== undefined && { submissionsOpen }),
                ...(registrationDeadline !== undefined && {
                    registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
                }),
                ...(submissionOpenAt !== undefined && {
                    submissionOpenAt: submissionOpenAt ? new Date(submissionOpenAt) : null,
                }),
                ...(submissionDeadline !== undefined && {
                    submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : null,
                }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update event error:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

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

        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event || event.hostId !== (session.user as any).id) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const registrations = await prisma.registration.findMany({
            where: { eventId },
            select: { id: true },
        });
        const registrationIds = registrations.map((r) => r.id);

        const participants = await prisma.participant.findMany({
            where: { registrationId: { in: registrationIds } },
            select: { id: true },
        });
        const participantIds = participants.map((p) => p.id);

        if (participantIds.length > 0) {
            await prisma.goodieLog.deleteMany({ where: { eventId } });
            await prisma.networkingMatch.deleteMany({ where: { eventId } });
            await prisma.participant.deleteMany({
                where: { registrationId: { in: registrationIds } },
            });
        }

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
        await prisma.event.delete({ where: { id: eventId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete event error:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
