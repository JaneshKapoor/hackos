import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function QRPage({ params }: { params: { token: string } }) {
    const participant = await prisma.participant.findUnique({
        where: { qrToken: params.token },
        include: {
            user: true,
            registration: {
                include: { event: true },
            },
        },
    });

    if (!participant) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-400 mb-2">Invalid QR Code</h1>
                    <p className="text-zinc-400">This QR code is not valid or has expired.</p>
                </div>
            </div>
        );
    }

    // For host scanning, the QR API endpoint handles this
    // For direct access, show participant info
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                    {participant.user.name?.[0] || "?"}
                </div>
                <h1 className="text-2xl font-bold mb-1">{participant.user.name}</h1>
                <p className="text-zinc-400 mb-4">{participant.user.email}</p>
                {participant.registration.teamName && (
                    <p className="text-sm text-cyan-400 mb-2">
                        Team: {participant.registration.teamName}
                    </p>
                )}
                <p className="text-sm text-zinc-500">
                    {participant.registration.event.title}
                </p>
                <div className="mt-6 flex gap-2 justify-center flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${participant.registration.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : participant.registration.status === "REJECTED"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                        {participant.registration.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${participant.isPresent
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-zinc-500/20 text-zinc-400"
                        }`}>
                        {participant.isPresent ? "Present ✅" : "Not checked in"}
                    </span>
                </div>
            </div>
        </div>
    );
}
