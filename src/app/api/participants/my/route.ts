import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Get all participant records for the logged-in user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const participants = await prisma.participant.findMany({
            where: { userId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, image: true, profilePoints: true },
                },
                registration: {
                    select: {
                        id: true,
                        teamName: true,
                        status: true,
                        event: { select: { id: true, title: true, slug: true } },
                    },
                },
                goodieLogs: { select: { item: true, givenAt: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(participants);
    } catch (error) {
        console.error("Fetch my participants error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
