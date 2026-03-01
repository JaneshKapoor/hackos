"use client";

import { HostSidebar } from "@/components/shared/Navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <HostSidebar />
            <main className="flex-1 p-4 sm:p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
