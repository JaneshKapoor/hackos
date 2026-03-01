import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET: Fetch events with full stats (optimized with aggregations)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        const where: any = { isPublished: true };
        if (userId && (session?.user as any)?.role === "HOST") {
            where.hostId = userId;
        }

        // Fetch events with only counts — no raw registration rows
        const events = await prisma.event.findMany({
            where,
            include: {
                _count: {
                    select: {
                        registrations: true,
                        submissions: true,
                    },
                },
                host: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { startDate: "desc" },
        });

        const eventIds = events.map((e) => e.id);

        // Single aggregation query: count registrations grouped by eventId + status
        const statusCounts = await prisma.registration.groupBy({
            by: ["eventId", "status"],
            where: { eventId: { in: eventIds } },
            _count: true,
        });

        // Count checked-in participants per event
        const checkedInCounts = await prisma.participant.groupBy({
            by: ["registrationId"],
            where: {
                isPresent: true,
                registration: { eventId: { in: eventIds } },
            },
            _count: true,
        });

        // Map checked-in counts back to events
        const registrationsForCheckin = checkedInCounts.length > 0
            ? await prisma.registration.findMany({
                where: { id: { in: checkedInCounts.map((c) => c.registrationId) } },
                select: { id: true, eventId: true },
            })
            : [];

        const regToEvent = new Map(registrationsForCheckin.map((r) => [r.id, r.eventId]));
        const checkedInByEvent = new Map<string, number>();
        for (const c of checkedInCounts) {
            const eid = regToEvent.get(c.registrationId);
            if (eid) checkedInByEvent.set(eid, (checkedInByEvent.get(eid) || 0) + c._count);
        }

        // Count teams (registrations with >1 participant) per event
        const teamCounts = await prisma.registration.findMany({
            where: { eventId: { in: eventIds } },
            select: {
                eventId: true,
                _count: { select: { participants: true } },
            },
        });

        const teamsByEvent = new Map<string, number>();
        for (const t of teamCounts) {
            if (t._count.participants > 1) {
                teamsByEvent.set(t.eventId, (teamsByEvent.get(t.eventId) || 0) + 1);
            }
        }

        // Build stats lookup
        const statsMap = new Map<string, { approved: number; pending: number }>();
        for (const sc of statusCounts) {
            const existing = statsMap.get(sc.eventId) || { approved: 0, pending: 0 };
            if (sc.status === "APPROVED") existing.approved = sc._count;
            if (sc.status === "PENDING") existing.pending = sc._count;
            statsMap.set(sc.eventId, existing);
        }

        const eventsWithStats = events.map((event) => {
            const s = statsMap.get(event.id) || { approved: 0, pending: 0 };
            return {
                ...event,
                stats: {
                    approved: s.approved,
                    pending: s.pending,
                    checkedIn: checkedInByEvent.get(event.id) || 0,
                    teams: teamsByEvent.get(event.id) || 0,
                },
            };
        });

        return NextResponse.json(eventsWithStats);
    } catch (error) {
        console.error("Events fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

// POST: Create new event
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            description,
            bannerImage,
            location,
            startDate,
            endDate,
            registrationDeadline,
            maxTeamSize,
            requiresApproval,
        } = body;

        const slug = slugify(title) + "-" + Date.now().toString(36);

        const event = await prisma.event.create({
            data: {
                hostId: (session.user as any).id,
                title,
                slug,
                description,
                bannerImage,
                location,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
                maxTeamSize: maxTeamSize || 4,
                requiresApproval: requiresApproval ?? true,
                isPublished: true,
            },
        });

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error("Event creation error:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
