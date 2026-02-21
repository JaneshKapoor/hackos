import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateNetworkingMatches } from "@/lib/openai";
import { sendEmail, networkingMatchEmail } from "@/lib/resend";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "HOST") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { eventId } = body;

        // Get all present participants
        const participants = await prisma.participant.findMany({
            where: {
                registration: { eventId, status: "APPROVED" },
                isPresent: true,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });

        if (participants.length < 2) {
            return NextResponse.json({ error: "Need at least 2 present participants" }, { status: 400 });
        }

        // Prepare profiles for OpenAI
        const profiles = participants.map((p) => ({
            id: p.id,
            name: p.user.name || "Anonymous",
            bio: p.bio || "",
            linkedinUrl: p.linkedinUrl || "",
        }));

        // Generate AI matches
        const matches = await generateNetworkingMatches(profiles);

        // Store matches
        const createdMatches = [];
        for (const match of matches) {
            // Validate participant IDs
            const p1 = participants.find((p) => p.id === match.participant1Id);
            const p2 = participants.find((p) => p.id === match.participant2Id);
            if (!p1 || !p2) continue;

            const existing = await prisma.networkingMatch.findFirst({
                where: {
                    eventId,
                    OR: [
                        { participant1Id: match.participant1Id, participant2Id: match.participant2Id },
                        { participant1Id: match.participant2Id, participant2Id: match.participant1Id },
                    ],
                },
            });

            if (!existing) {
                const created = await prisma.networkingMatch.create({
                    data: {
                        eventId,
                        participant1Id: match.participant1Id,
                        participant2Id: match.participant2Id,
                    },
                });
                createdMatches.push(created);

                // Notify both participants
                await Promise.allSettled([
                    sendEmail({
                        to: p1.user.email,
                        subject: `New networking match! 🤝`,
                        html: networkingMatchEmail(
                            p1.user.name || "Hacker",
                            p2.user.name || "Hacker",
                            p2.bio || "Fellow hacker",
                            p2.linkedinUrl || ""
                        ),
                    }),
                    sendEmail({
                        to: p2.user.email,
                        subject: `New networking match! 🤝`,
                        html: networkingMatchEmail(
                            p2.user.name || "Hacker",
                            p1.user.name || "Hacker",
                            p1.bio || "Fellow hacker",
                            p1.linkedinUrl || ""
                        ),
                    }),
                ]);
            }
        }

        return NextResponse.json({
            success: true,
            matchesCreated: createdMatches.length,
            totalMatches: matches.length,
        });
    } catch (error) {
        console.error("Networking match error:", error);
        return NextResponse.json({ error: "Failed to generate matches" }, { status: 500 });
    }
}
