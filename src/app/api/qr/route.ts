import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const participantIncludes = {
    user: { select: { id: true, name: true, email: true, image: true } },
    registration: {
        select: {
            id: true,
            teamName: true,
            status: true,
            event: { select: { id: true, title: true } },
        },
    },
    goodieLogs: { select: { item: true, givenAt: true } },
};

// QR code handler - looks up participant by qrToken, email, or name
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");
        const search = searchParams.get("search");

        // Lookup by QR token
        if (token) {
            const participant = await prisma.participant.findUnique({
                where: { qrToken: token },
                include: participantIncludes,
            });

            if (!participant) {
                return NextResponse.json({ error: "Invalid QR code" }, { status: 404 });
            }
            return NextResponse.json(participant);
        }

        // Lookup by email or name
        if (search) {
            const s = search.toLowerCase().trim();

            // Try finding by exact email first
            const byEmail = await prisma.participant.findFirst({
                where: {
                    user: { email: { equals: s, mode: "insensitive" } },
                },
                include: participantIncludes,
            });
            if (byEmail) return NextResponse.json(byEmail);

            // Then try name contains
            const byName = await prisma.participant.findFirst({
                where: {
                    user: { name: { contains: s, mode: "insensitive" } },
                },
                include: participantIncludes,
            });
            if (byName) return NextResponse.json(byName);

            return NextResponse.json({ error: "Participant not found" }, { status: 404 });
        }

        return NextResponse.json({ error: "token or search param required" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to look up" }, { status: 500 });
    }
}
