import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: List submissions
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get("eventId");
        if (!eventId) {
            return NextResponse.json({ error: "eventId required" }, { status: 400 });
        }

        const submissions = await prisma.submission.findMany({
            where: { eventId },
            include: {
                registration: {
                    include: {
                        participants: {
                            include: { user: { select: { name: true, email: true } } },
                        },
                    },
                },
                scores: {
                    include: { judge: { select: { name: true, email: true } } },
                },
            },
            orderBy: { submittedAt: "desc" },
        });

        return NextResponse.json(submissions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }
}

// POST: Submit project
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { registrationId, eventId, projectTitle, description, repoUrl, demoUrl, presentationUrl } = body;

        // Check event submissions are open
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event?.submissionsOpen) {
            return NextResponse.json({ error: "Submissions are not open" }, { status: 400 });
        }

        // Check for existing submission
        const existing = await prisma.submission.findFirst({
            where: { registrationId, eventId },
        });

        if (existing) {
            // Update existing
            const updated = await prisma.submission.update({
                where: { id: existing.id },
                data: { projectTitle, description, repoUrl, demoUrl, presentationUrl },
            });
            return NextResponse.json(updated);
        }

        const submission = await prisma.submission.create({
            data: {
                registrationId,
                eventId,
                projectTitle,
                description,
                repoUrl,
                demoUrl,
                presentationUrl,
            },
        });

        return NextResponse.json(submission, { status: 201 });
    } catch (error) {
        console.error("Submission error:", error);
        return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
    }
}
