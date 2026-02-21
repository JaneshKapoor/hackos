import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail, judgeInviteEmail } from "@/lib/resend";

// GET: Fetch judging data
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get("eventId");
        if (!eventId) {
            return NextResponse.json({ error: "eventId required" }, { status: 400 });
        }

        const [judges, scores, submissions] = await Promise.all([
            prisma.judgeAssignment.findMany({
                where: { eventId },
                include: { judge: { select: { name: true, email: true } } },
            }),
            prisma.score.findMany({
                where: { submission: { eventId } },
                include: {
                    judge: { select: { name: true, email: true } },
                    submission: { select: { projectTitle: true, registrationId: true } },
                },
            }),
            prisma.submission.findMany({
                where: { eventId },
                include: {
                    registration: {
                        select: {
                            teamName: true,
                            participants: {
                                include: { user: { select: { name: true } } },
                            },
                        },
                    },
                    scores: true,
                },
            }),
        ]);

        return NextResponse.json({ judges, scores, submissions });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch judging data" }, { status: 500 });
    }
}

// POST: Add judge or submit score
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        if (action === "add-judge") {
            const { eventId, judgeEmail } = body;

            const event = await prisma.event.findUnique({ where: { id: eventId } });
            if (!event) {
                return NextResponse.json({ error: "Event not found" }, { status: 404 });
            }

            // Create judge user if not exists
            let judgeUser = await prisma.user.findUnique({ where: { email: judgeEmail } });
            if (!judgeUser) {
                judgeUser = await prisma.user.create({
                    data: { email: judgeEmail, name: judgeEmail.split("@")[0], role: "JUDGE" },
                });
            } else {
                await prisma.user.update({
                    where: { id: judgeUser.id },
                    data: { role: "JUDGE" },
                });
            }

            const assignment = await prisma.judgeAssignment.create({
                data: {
                    eventId,
                    judgeEmail,
                    judgeUserId: judgeUser.id,
                },
            });

            // Send invite email
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            await sendEmail({
                to: judgeEmail,
                subject: `You're invited to judge — ${event.title}`,
                html: judgeInviteEmail(event.title, `${appUrl}/judge`),
            });

            return NextResponse.json(assignment, { status: 201 });
        }

        if (action === "submit-score") {
            const { submissionId, round, technicalImpl, techStack, innovation, impact, presentation, notes } = body;
            const total = technicalImpl + techStack + innovation + impact + presentation;

            const score = await prisma.score.upsert({
                where: {
                    submissionId_judgeId_round: {
                        submissionId,
                        judgeId: (session.user as any).id,
                        round: round || "PRELIMINARY",
                    },
                },
                create: {
                    submissionId,
                    judgeId: (session.user as any).id,
                    round: round || "PRELIMINARY",
                    technicalImpl,
                    techStack,
                    innovation,
                    impact,
                    presentation,
                    total,
                    notes,
                },
                update: {
                    technicalImpl,
                    techStack,
                    innovation,
                    impact,
                    presentation,
                    total,
                    notes,
                },
            });

            return NextResponse.json(score);
        }

        // Shortlist submissions for live pitching
        if (action === "shortlist") {
            const { submissionIds, eventId } = body;

            // Reset all
            await prisma.submission.updateMany({
                where: { eventId },
                data: { shortlisted: false, pitchOrder: null },
            });

            // Set shortlisted with order
            for (let i = 0; i < submissionIds.length; i++) {
                await prisma.submission.update({
                    where: { id: submissionIds[i] },
                    data: { shortlisted: true, pitchOrder: i + 1 },
                });
            }

            return NextResponse.json({ success: true });
        }

        // Start/advance live pitching
        if (action === "set-active-pitch") {
            const { eventId, submissionId } = body;

            await prisma.event.update({
                where: { id: eventId },
                data: {
                    livePitchingActive: true,
                    currentPitchTeamId: submissionId || null,
                },
            });

            return NextResponse.json({ success: true });
        }

        // Compile results
        if (action === "compile-results") {
            const { eventId } = body;

            await prisma.event.update({
                where: { id: eventId },
                data: {
                    livePitchingActive: false,
                    resultsPublic: true,
                },
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (error) {
        console.error("Judging error:", error);
        return NextResponse.json({ error: "Failed to process judging action" }, { status: 500 });
    }
}
