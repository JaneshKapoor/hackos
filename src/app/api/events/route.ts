import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET: Fetch events
export async function GET() {
    try {
        const events = await prisma.event.findMany({
            where: { isPublished: true },
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

        return NextResponse.json(events);
    } catch (error) {
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
