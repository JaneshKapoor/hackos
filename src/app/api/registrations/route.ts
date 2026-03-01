import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail, registrationConfirmationEmail } from "@/lib/resend";
import { v4 as uuid } from "uuid";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get("eventId");

        if (!eventId) {
            return NextResponse.json({ error: "eventId required" }, { status: 400 });
        }

        const status = searchParams.get("status");
        const search = searchParams.get("search");

        const where: any = { eventId };
        if (status && status !== "ALL") {
            where.status = status;
        }

        // Push search filtering into the database query
        if (search) {
            where.OR = [
                { teamLead: { name: { contains: search, mode: "insensitive" } } },
                { teamLead: { email: { contains: search, mode: "insensitive" } } },
                { teamName: { contains: search, mode: "insensitive" } },
            ];
        }

        const registrations = await prisma.registration.findMany({
            where,
            include: {
                teamLead: {
                    select: { id: true, name: true, email: true },
                },
                participants: {
                    select: {
                        id: true,
                        selfieUrl: true,
                        linkedinUrl: true,
                        resumeUrl: true,
                        bio: true,
                        isPresent: true,
                        goodieReceived: true,
                        isTeamLead: true,
                        qrToken: true,
                        user: {
                            select: { id: true, name: true, email: true, image: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(registrations);
    } catch (error) {
        console.error("Fetch registrations error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventId, teamName, isTeam, leader, members } = body;

        // Find or create event
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Find or create leader user
        let leaderUser = await prisma.user.findUnique({ where: { email: leader.email } });
        if (!leaderUser) {
            leaderUser = await prisma.user.create({
                data: {
                    email: leader.email,
                    name: leader.name,
                    role: "PARTICIPANT",
                },
            });
        }

        // Check for existing registration
        const existingReg = await prisma.registration.findFirst({
            where: {
                eventId,
                teamLeadId: leaderUser.id,
            },
        });

        if (existingReg) {
            return NextResponse.json({ error: "You've already registered for this event" }, { status: 400 });
        }

        // Create registration
        const registration = await prisma.registration.create({
            data: {
                eventId,
                teamName: isTeam ? teamName : null,
                teamLeadId: leaderUser.id,
                status: event.requiresApproval ? "PENDING" : "APPROVED",
                participants: {
                    create: [
                        {
                            userId: leaderUser.id,
                            isTeamLead: true,
                            selfieUrl: leader.selfie || null,
                            linkedinUrl: leader.linkedinUrl || null,
                            bio: leader.bio || null,
                            qrToken: uuid(),
                        },
                    ],
                },
            },
        });

        // Create team member participants
        if (isTeam && members?.length > 0) {
            for (const member of members) {
                if (!member.email) continue;

                let memberUser = await prisma.user.findUnique({ where: { email: member.email } });
                if (!memberUser) {
                    memberUser = await prisma.user.create({
                        data: {
                            email: member.email,
                            name: member.name,
                            role: "PARTICIPANT",
                        },
                    });
                }

                await prisma.participant.create({
                    data: {
                        registrationId: registration.id,
                        userId: memberUser.id,
                        isTeamLead: false,
                        linkedinUrl: member.linkedinUrl || null,
                        bio: member.bio || null,
                        qrToken: uuid(),
                    },
                });
            }
        }

        // Send confirmation email
        await sendEmail({
            to: leader.email,
            subject: `Registration confirmed — ${event.title}`,
            html: registrationConfirmationEmail(leader.name, event.title),
        });

        return NextResponse.json({
            success: true,
            registrationId: registration.id,
            status: registration.status,
        }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Failed to register" }, { status: 500 });
    }
}
