import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail, approvalEmail, rejectionEmail } from "@/lib/resend";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "HOST") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body; // "approve" or "reject"
        const participantId = params.id;

        const participant = await prisma.participant.findUnique({
            where: { id: participantId },
            include: {
                user: true,
                registration: {
                    include: { event: true },
                },
            },
        });

        if (!participant) {
            return NextResponse.json({ error: "Participant not found" }, { status: 404 });
        }

        if (action === "approve") {
            await prisma.registration.update({
                where: { id: participant.registrationId },
                data: { status: "APPROVED" },
            });

            // Send email in background — don't block the approval response
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            sendEmail({
                to: participant.user.email,
                subject: `You're approved! — ${participant.registration.event.title}`,
                html: approvalEmail(
                    participant.user.name || "Hacker",
                    participant.registration.event.title,
                    `${appUrl}/my`
                ),
            }).then((result) => {
                console.log("Approval email sent:", result);
            }).catch((err) => {
                console.error("Approval email failed (non-blocking):", err);
            });

        } else if (action === "reject") {
            await prisma.registration.update({
                where: { id: participant.registrationId },
                data: { status: "REJECTED" },
            });

            // Send email in background — don't block the rejection response
            sendEmail({
                to: participant.user.email,
                subject: `Application update — ${participant.registration.event.title}`,
                html: rejectionEmail(
                    participant.user.name || "Hacker",
                    participant.registration.event.title
                ),
            }).then((result) => {
                console.log("Rejection email sent:", result);
            }).catch((err) => {
                console.error("Rejection email failed (non-blocking):", err);
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Approval error:", error);
        return NextResponse.json({ error: "Failed to update participant" }, { status: 500 });
    }
}
