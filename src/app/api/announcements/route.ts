import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail, announcementEmail } from "@/lib/resend";

// GET
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get("eventId");
        if (!eventId) {
            return NextResponse.json({ error: "eventId required" }, { status: 400 });
        }

        const announcements = await prisma.announcement.findMany({
            where: { eventId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(announcements);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
    }
}

// POST: Create announcement
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "HOST") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { eventId, title, bodyText, targetGroup } = body;

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const announcement = await prisma.announcement.create({
            data: {
                eventId,
                title,
                body: bodyText,
                targetGroup: targetGroup || "ALL",
            },
        });

        // Get target participants' emails
        let whereClause: any = { registration: { eventId } };
        if (targetGroup === "APPROVED") {
            whereClause.registration.status = "APPROVED";
        } else if (targetGroup === "TEAM_LEADS") {
            whereClause.isTeamLead = true;
            whereClause.registration.status = "APPROVED";
        }

        const participants = await prisma.participant.findMany({
            where: whereClause,
            include: { user: { select: { email: true } } },
        });

        // Send emails (batch)
        const emailPromises = participants.map((p) =>
            sendEmail({
                to: p.user.email,
                subject: `📢 ${title} — ${event.title}`,
                html: announcementEmail(event.title, title, bodyText),
            })
        );

        await Promise.allSettled(emailPromises);

        return NextResponse.json(announcement, { status: 201 });
    } catch (error) {
        console.error("Announcement error:", error);
        return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
    }
}
