"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import {
    Zap,
    Users,
    QrCode,
    Trophy,
    Brain,
    Camera,
    ArrowRight,
    Sparkles,
} from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Zap className="h-6 w-6 text-purple-500" />
                        <span className="text-xl font-bold gradient-text">Hackos</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Log in</Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="gradient" size="sm">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-8">
                            <Sparkles className="h-4 w-4" />
                            The hackathon platform built for hackers
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.1}>
                        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
                            Run hackathons{" "}
                            <span className="gradient-text">like a pro</span>
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
                            From registration to judging, QR check-ins to AI-powered networking —
                            everything you need to run world-class hackathons in one platform.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/login">
                                <Button variant="gradient" size="xl" className="w-full sm:w-auto">
                                    Start Organizing <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/event/demo-hackathon">
                                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                                    View Demo Event
                                </Button>
                            </Link>
                        </div>
                    </FadeIn>

                    {/* Glow effect */}
                    <div className="relative mt-20">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-cyan-500/20 to-purple-600/20 blur-3xl" />
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="relative"
                        >
                            <div className="rounded-2xl border border-white/10 bg-[#111111] p-2 shadow-2xl shadow-purple-500/10">
                                <div className="rounded-xl bg-[#0a0a0a] p-8 min-h-[300px] flex items-center justify-center">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full max-w-lg">
                                        {[
                                            { label: "Registrations", value: "247", color: "text-purple-400" },
                                            { label: "Checked In", value: "189", color: "text-cyan-400" },
                                            { label: "Teams", value: "52", color: "text-emerald-400" },
                                            { label: "Submissions", value: "48", color: "text-yellow-400" },
                                            { label: "Judges", value: "12", color: "text-pink-400" },
                                            { label: "Avg Score", value: "8.4", color: "text-orange-400" },
                                        ].map((stat, i) => (
                                            <motion.div
                                                key={stat.label}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                                                className="text-center p-4 rounded-lg border border-white/5 bg-white/[0.02]"
                                            >
                                                <div className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                                                    {stat.value}
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <FadeIn>
                        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
                            Everything you need
                        </h2>
                        <p className="text-zinc-400 text-center mb-16 max-w-xl mx-auto">
                            A complete toolkit for organizing unforgettable hackathons
                        </p>
                    </FadeIn>

                    <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                        {[
                            {
                                icon: QrCode,
                                title: "One QR for Everything",
                                desc: "Single QR code per participant handles check-in, goodies, and networking connections.",
                                gradient: "from-purple-500 to-indigo-500",
                            },
                            {
                                icon: Users,
                                title: "Team Management",
                                desc: "Support for solo and team registrations with approval workflows and member management.",
                                gradient: "from-cyan-500 to-blue-500",
                            },
                            {
                                icon: Trophy,
                                title: "Live Judging",
                                desc: "Real-time scoring with synchronized judge views and dramatic results reveal.",
                                gradient: "from-yellow-500 to-orange-500",
                            },
                            {
                                icon: Brain,
                                title: "AI Networking",
                                desc: "OpenAI-powered matching connects participants with complementary skills and interests.",
                                gradient: "from-pink-500 to-rose-500",
                            },
                            {
                                icon: Camera,
                                title: "Face Recognition",
                                desc: "Participants can find their photos using selfie-based face matching powered by face-api.js.",
                                gradient: "from-emerald-500 to-teal-500",
                            },
                            {
                                icon: Zap,
                                title: "PWA Support",
                                desc: "Install on any device. QR codes work offline so participants can check in anywhere.",
                                gradient: "from-violet-500 to-purple-500",
                            },
                        ].map((feature) => (
                            <StaggerItem key={feature.title}>
                                <div className="group relative rounded-xl border border-white/5 bg-[#111111] p-6 hover:border-white/10 transition-all hover:bg-[#141414]">
                                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} mb-4`}>
                                        <feature.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerChildren>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 px-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-500" />
                        <span className="font-semibold gradient-text">Hackos</span>
                    </div>
                    <p className="text-sm text-zinc-500">
                        Built with ❤️ for the hacker community
                    </p>
                </div>
            </footer>
        </div>
    );
}
