"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ParticipantBottomNav, Navbar } from "@/components/shared/Navbar";
import { QRDisplay } from "@/components/shared/QRDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import {
    QrCode, Trophy, Brain, Code, Megaphone, Star,
    Camera, Clock, CheckCircle, XCircle,
} from "lucide-react";
import Link from "next/link";

function AnimatedPoints({ value }: { value: number }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let current = 0;
        const timer = setInterval(() => {
            current += 1;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, 30);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{count}</span>;
}

export default function ParticipantDashboard() {
    // Mock data - in production, fetch from session/API
    const [participant, setParticipant] = useState<any>({
        qrToken: "demo-token-123",
        isPresent: false,
        networkingPoints: 15,
        registration: { status: "APPROVED", teamName: "The Debuggers" },
        user: { name: "Demo User", profilePoints: 25 },
    });

    const [announcements, setAnnouncements] = useState<any[]>([]);

    const statusIcon = {
        PENDING: <Clock className="h-5 w-5 text-yellow-400" />,
        APPROVED: <CheckCircle className="h-5 w-5 text-emerald-400" />,
        REJECTED: <XCircle className="h-5 w-5 text-red-400" />,
    };

    const statusDisplay = participant.registration?.status || "PENDING";

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-20 lg:pb-0">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Welcome Header */}
                <FadeIn>
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                            Hey, {participant.user?.name || "Hacker"} 👋
                        </h1>
                        <div className="flex items-center justify-center gap-2">
                            {statusIcon[statusDisplay as keyof typeof statusIcon]}
                            <Badge
                                variant={
                                    statusDisplay === "APPROVED" ? "success" :
                                        statusDisplay === "REJECTED" ? "destructive" : "warning"
                                }
                            >
                                {statusDisplay}
                            </Badge>
                            {participant.registration?.teamName && (
                                <span className="text-sm text-zinc-400">
                                    · {participant.registration.teamName}
                                </span>
                            )}
                        </div>
                    </div>
                </FadeIn>

                {/* QR Code */}
                {statusDisplay === "APPROVED" && (
                    <FadeIn delay={0.1} className="flex justify-center mb-8">
                        <QRDisplay qrToken={participant.qrToken} size={220} />
                    </FadeIn>
                )}

                {/* Points */}
                <FadeIn delay={0.15}>
                    <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/20 mb-6">
                        <CardContent className="py-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-purple-500/20">
                                    <Star className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-400">Profile Points</p>
                                    <p className="text-2xl font-bold text-purple-300">
                                        <AnimatedPoints value={participant.user?.profilePoints || 0} />
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-zinc-400">Networking</p>
                                <p className="text-xl font-bold text-cyan-300">
                                    <AnimatedPoints value={participant.networkingPoints || 0} />
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* Quick Actions */}
                <StaggerChildren className="grid grid-cols-2 gap-4 mb-8" staggerDelay={0.05} initialDelay={0.2}>
                    <StaggerItem>
                        <Link href="/my/submissions">
                            <Card className="bg-[#111111] border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group h-full">
                                <CardContent className="pt-6 text-center">
                                    <Code className="h-8 w-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <p className="font-medium text-sm">My Submissions</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </StaggerItem>
                    <StaggerItem>
                        <Link href="/my/photos">
                            <Card className="bg-[#111111] border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group h-full">
                                <CardContent className="pt-6 text-center">
                                    <Camera className="h-8 w-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <p className="font-medium text-sm">My Photos</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </StaggerItem>
                    <StaggerItem>
                        <Link href="/my/network">
                            <Card className="bg-[#111111] border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group h-full">
                                <CardContent className="pt-6 text-center">
                                    <Brain className="h-8 w-8 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <p className="font-medium text-sm">My Network</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </StaggerItem>
                    <StaggerItem>
                        <Card className="bg-[#111111] border-white/5 hover:border-yellow-500/30 transition-all cursor-pointer group h-full">
                            <CardContent className="pt-6 text-center">
                                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <p className="font-medium text-sm">Results</p>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                </StaggerChildren>

                {/* Announcements Feed */}
                <FadeIn delay={0.4}>
                    <div className="flex items-center gap-2 mb-4">
                        <Megaphone className="h-5 w-5 text-purple-400" />
                        <h2 className="text-lg font-semibold">Announcements</h2>
                    </div>
                    {announcements.length === 0 ? (
                        <Card className="bg-[#111111] border-white/5">
                            <CardContent className="py-8 text-center">
                                <p className="text-zinc-400 text-sm">No announcements yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {announcements.map((a) => (
                                <Card key={a.id} className="bg-[#111111] border-white/5">
                                    <CardContent className="p-4">
                                        <h4 className="font-medium text-sm">{a.title}</h4>
                                        <p className="text-xs text-zinc-400 mt-1">{a.body}</p>
                                        <p className="text-xs text-zinc-600 mt-2">
                                            {new Date(a.createdAt).toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </FadeIn>
            </main>

            <ParticipantBottomNav />
        </div>
    );
}
