import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: List event photos
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get("eventId");
        if (!eventId) {
            return NextResponse.json({ error: "eventId required" }, { status: 400 });
        }

        const photos = await prisma.eventPhoto.findMany({
            where: { eventId },
            orderBy: { uploadedAt: "desc" },
        });

        return NextResponse.json(photos);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
    }
}

// POST: Upload/add photo URLs (face matching is done client-side)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventId, imageUrls } = body;

        if (!eventId || !imageUrls?.length) {
            return NextResponse.json({ error: "eventId and imageUrls required" }, { status: 400 });
        }

        const photos = await prisma.eventPhoto.createMany({
            data: imageUrls.map((url: string) => ({
                eventId,
                imageUrl: url,
            })),
        });

        return NextResponse.json({ success: true, count: photos.count }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to add photos" }, { status: 500 });
    }
}
