import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// QR code handler - looks up participant by qrToken
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token required" }, { status: 400 });
        }

        const participant = await prisma.participant.findUnique({
            where: { qrToken: token },
            include: {
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
            },
        });

        if (!participant) {
            return NextResponse.json({ error: "Invalid QR code" }, { status: 404 });
        }

        return NextResponse.json(participant);
    } catch (error) {
        return NextResponse.json({ error: "Failed to look up QR" }, { status: 500 });
    }
}
