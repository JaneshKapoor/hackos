import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET: Fetch events with full stats
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        const where: any = { isPublished: true };
        // If host, show their events; otherwise show all published
        if (userId && (session?.user as any)?.role === "HOST") {
            where.hostId = userId;
        }

        const events = await prisma.event.findMany({
            where,
            include: {
                _count: {
                    select: {
                        registrations: true,
                        submissions: true,
                    },
                },
                registrations: {
                    select: {
                        status: true,
                        participants: {
                            select: { isPresent: true },
                        },
                    },
                },
                host: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { startDate: "desc" },
        });

        // Compute stats for each event
        const eventsWithStats = events.map((event) => {
            const approved = event.registrations.filter((r) => r.status === "APPROVED").length;
            const pending = event.registrations.filter((r) => r.status === "PENDING").length;
            const checkedIn = event.registrations.reduce(
                (acc, r) => acc + r.participants.filter((p) => p.isPresent).length, 0
            );
            const teams = event.registrations.filter((r) => r.participants.length > 1).length;

            // Remove raw registrations from response to keep it clean
            const { registrations, ...rest } = event;

            return {
                ...rest,
                stats: { approved, pending, checkedIn, teams },
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
