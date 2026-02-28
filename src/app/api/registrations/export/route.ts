import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get("eventId");

        if (!eventId) {
            return NextResponse.json({ error: "eventId required" }, { status: 400 });
        }

        // Get event title for the filename
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { title: true },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const registrations = await prisma.registration.findMany({
            where: { eventId },
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
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Build CSV rows
        const csvData = registrations.map((reg) => {
            const participant = reg.participants?.[0];
            const user = reg.teamLead || participant?.user || { name: "Unknown", email: "" };
            return {
                "Name": user.name || "Unknown",
                "Email": user.email || "",
                "Team Name": reg.teamName || "",
                "LinkedIn": participant?.linkedinUrl || "",
                "Bio": participant?.bio || "",
                "Status": reg.status || "",
                "Checked In": participant?.isPresent ? "Yes" : "No",
                "Goodie Received": participant?.goodieReceived ? "Yes" : "No",
            };
        });

        const csv = Papa.unparse(csvData);

        // Sanitize filename
        const safeName = event.title.replace(/[^a-zA-Z0-9 _-]/g, "").trim();
        const fileName = `${safeName}_participants.csv`;

        // Return CSV with proper headers so browser downloads it as a file
        return new Response("\uFEFF" + csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error("Export CSV error:", error);
        return NextResponse.json({ error: "Failed to export" }, { status: 500 });
    }
}
