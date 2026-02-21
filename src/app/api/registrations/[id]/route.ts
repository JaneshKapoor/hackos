import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE: Remove a registration and all its participants
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "HOST") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const registrationId = params.id;

        // Delete related participants first (cascade)
        await prisma.participant.deleteMany({
            where: { registrationId },
        });

        // Delete the registration
        await prisma.registration.delete({
            where: { id: registrationId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete registration error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
