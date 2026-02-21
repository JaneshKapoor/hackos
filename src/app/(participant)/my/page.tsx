"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
    Camera, Clock, CheckCircle, XCircle, Loader2, ChevronDown,
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
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [participants, setParticipants] = useState<any[]>([]);
    const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [showEventPicker, setShowEventPicker] = useState(false);

    // Fetch participant data for the logged-in user
    useEffect(() => {
        if (!session?.user) return;

        const userId = (session.user as any).id;
        if (!userId) return;

        const fetchData = async () => {
            try {
                // Fetch participant records for this user
                const res = await fetch(`/api/qr?search=${encodeURIComponent((session.user as any).email)}`);
                if (res.ok) {
                    const data = await res.json();
                    // API returns single result; wrap if needed
                    if (data && !data.error) {
                        // Need to get ALL participant records for this user
                        const allRes = await fetch(`/api/participants/my`);
                        if (allRes.ok) {
                            const allData = await allRes.json();
                            setParticipants(allData);
                            // Auto-select: if only one event, select it; otherwise let user choose
                            if (allData.length === 1) {
                                setSelectedParticipant(allData[0]);
                            } else if (allData.length > 0) {
                                setSelectedParticipant(allData[0]);
                            }
                        } else {
                            // Fallback: use single result from QR lookup
                            setParticipants([data]);
                            setSelectedParticipant(data);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching participant data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    // Fetch announcements for the selected event
    useEffect(() => {
        if (!selectedParticipant?.registration?.event?.id) return;
        const eventId = selectedParticipant.registration.event.id;

        fetch(`/api/announcements?eventId=${eventId}`)
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) setAnnouncements(data);
            })
            .catch(() => { });
    }, [selectedParticipant]);

    const statusIcon = {
        PENDING: <Clock className="h-5 w-5 text-yellow-400" />,
        APPROVED: <CheckCircle className="h-5 w-5 text-emerald-400" />,
        REJECTED: <XCircle className="h-5 w-5 text-red-400" />,
    };

    const statusDisplay = selectedParticipant?.registration?.status || "PENDING";
    const userName = selectedParticipant?.user?.name || (session?.user as any)?.name || "Hacker";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-20 lg:pb-0">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Welcome Header */}
                <FadeIn>
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                            Hey, {userName} 👋
                        </h1>

                        {/* Event Selector (if multiple events) */}
                        {participants.length > 1 && (
                            <div className="relative inline-block mb-3">
                                <button
                                    onClick={() => setShowEventPicker(!showEventPicker)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all text-sm"
                                >
                                    <span className="text-zinc-300">
                                        {selectedParticipant?.registration?.event?.title || "Select Event"}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${showEventPicker ? "rotate-180" : ""}`} />
                                </button>
                                {showEventPicker && (
                                    <div className="absolute top-full mt-2 left-0 right-0 bg-[#111111] border border-white/10 rounded-lg shadow-xl z-30 overflow-hidden">
                                        {participants.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedParticipant(p);
                                                    setShowEventPicker(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-all border-b border-white/5 last:border-0 ${selectedParticipant?.id === p.id ? "text-purple-400 bg-purple-500/5" : "text-zinc-300"
                                                    }`}
                                            >
                                                {p.registration?.event?.title || "Unknown Event"}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Single event title */}
                        {participants.length === 1 && selectedParticipant?.registration?.event?.title && (
                            <p className="text-sm text-cyan-400 mb-2">
                                {selectedParticipant.registration.event.title}
                            </p>
                        )}

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
                            {selectedParticipant?.registration?.teamName && (
                                <span className="text-sm text-zinc-400">
                                    · {selectedParticipant.registration.teamName}
                                </span>
                            )}
                        </div>
                    </div>
                </FadeIn>

                {/* QR Code */}
                {statusDisplay === "APPROVED" && selectedParticipant?.qrToken && (
                    <FadeIn delay={0.1} className="flex justify-center mb-8">
                        <QRDisplay qrToken={selectedParticipant.qrToken} size={220} />
                    </FadeIn>
                )}

                {/* Not registered message */}
                {!selectedParticipant && (
                    <FadeIn delay={0.1}>
                        <Card className="bg-[#111111] border-white/5 mb-6">
                            <CardContent className="py-8 text-center">
                                <QrCode className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-400 mb-2">You haven't registered for any events yet</p>
                                <p className="text-zinc-500 text-sm mb-4">Browse events and register to get your QR code</p>
                                <Link href="/">
                                    <Button variant="gradient">Browse Events</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </FadeIn>
                )}

                {/* Points */}
                {selectedParticipant && (
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
                                            <AnimatedPoints value={selectedParticipant.user?.profilePoints || 0} />
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-zinc-400">Networking</p>
                                    <p className="text-xl font-bold text-cyan-300">
                                        <AnimatedPoints value={selectedParticipant.networkingPoints || 0} />
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </FadeIn>
                )}

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
