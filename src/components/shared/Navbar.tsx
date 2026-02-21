"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    Zap, Home, QrCode, Gift, Megaphone, Code,
    Trophy, Users, Brain, BarChart3, ScanLine
} from "lucide-react";
import { cn } from "@/lib/utils";

const hostNavItems = [
    { href: "/dashboard", label: "Overview", icon: Home },
    { href: "/dashboard/participants", label: "Participants", icon: Users },
    { href: "/dashboard/scan", label: "Scan QR", icon: ScanLine },
    { href: "/dashboard/goodies", label: "Goodies", icon: Gift },
    { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
    { href: "/dashboard/networking", label: "Networking", icon: Brain },
    { href: "/dashboard/submissions", label: "Submissions", icon: Code },
    { href: "/dashboard/judging", label: "Judging", icon: BarChart3 },
    { href: "/dashboard/results", label: "Results", icon: Trophy },
];

export function HostSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-white/5 bg-[#0a0a0a] p-4">
            <Link href="/" className="flex items-center gap-2 px-3 py-4 mb-6">
                <Zap className="h-6 w-6 text-purple-500" />
                <span className="text-xl font-bold gradient-text">Hackos</span>
            </Link>

            <nav className="flex-1 space-y-1">
                {hostNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                isActive
                                    ? "text-white"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/10 rounded-lg border border-purple-500/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon className="h-4 w-4 relative z-10" />
                            <span className="relative z-10">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-4 border-t border-white/5">
                <Link
                    href="/login"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    Sign Out
                </Link>
            </div>
        </aside>
    );
}

// Mobile bottom nav for participants
const participantMobileNav = [
    { href: "/my", label: "Home", icon: Home },
    { href: "/my/submissions", label: "Submit", icon: Code },
    { href: "/my/photos", label: "Photos", icon: QrCode },
    { href: "/my/network", label: "Network", icon: Brain },
];

export function ParticipantBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-2 pb-safe">
            <div className="flex items-center justify-around h-16">
                {participantMobileNav.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 px-3 py-1 min-w-[60px] transition-all",
                                isActive ? "text-purple-400" : "text-zinc-500"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeMobileNav"
                                    className="absolute -top-px left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon className="h-5 w-5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <span className="text-lg font-bold gradient-text">Hackos</span>
                </Link>
            </div>
        </nav>
    );
}
