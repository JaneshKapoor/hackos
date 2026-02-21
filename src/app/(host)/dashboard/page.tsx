"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { HostSidebar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import {
    Users,
    CheckCircle,
    UserCheck,
    Code,
    Clock,
    UsersRound,
    Plus,
    Loader2,
    Zap,
    BarChart3,
    Share2,
    Copy,
    Check,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";

function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        const totalFrames = Math.round(duration * 60);
        const increment = end / totalFrames;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, 1000 / 60);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count}</span>;
}

export default function DashboardPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
        maxTeamSize: 4,
    });

    const getEventUrl = (slug: string) => {
        const base = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        return `${base}/event/${slug}`;
    };

    const copyEventLink = async (eventId: string, slug: string) => {
        try {
            await navigator.clipboard.writeText(getEventUrl(slug));
            setCopiedId(eventId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch { }
    };

    const shareEvent = async (event: any) => {
        const url = getEventUrl(event.slug);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: `Register for ${event.title}!`,
                    url,
                });
            } catch { }
        } else {
            copyEventLink(event.id, event.slug);
        }
    };

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch("/api/events");
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch { }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const createEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEvent),
            });
            if (res.ok) {
                await fetchEvents();
                setShowCreateForm(false);
                setNewEvent({ title: "", description: "", location: "", startDate: "", endDate: "", maxTeamSize: 4 });
            }
        } catch { }
        setCreating(false);
    };

    // Compute real stats from events
    const totalRegistrations = events.reduce((acc, e) => acc + (e._count?.registrations || 0), 0);
    const totalApproved = events.reduce((acc, e) => acc + (e.stats?.approved || 0), 0);
    const totalCheckedIn = events.reduce((acc, e) => acc + (e.stats?.checkedIn || 0), 0);
    const totalSubmissions = events.reduce((acc, e) => acc + (e._count?.submissions || 0), 0);
    const totalPending = events.reduce((acc, e) => acc + (e.stats?.pending || 0), 0);
    const totalTeams = events.reduce((acc, e) => acc + (e.stats?.teams || 0), 0);

    const stats = [
        { label: "Total Registrations", value: totalRegistrations, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
        { label: "Approved", value: totalApproved, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Checked In", value: totalCheckedIn, icon: UserCheck, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        { label: "Submissions", value: totalSubmissions, icon: Code, color: "text-yellow-400", bg: "bg-yellow-500/10" },
        { label: "Pending Review", value: totalPending, icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10" },
        { label: "Teams", value: totalTeams, icon: UsersRound, color: "text-pink-400", bg: "bg-pink-500/10" },
    ];

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <HostSidebar />

            <main className="flex-1 p-4 sm:p-8 overflow-auto">
                <FadeIn>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
                            <p className="text-zinc-400 mt-1">Manage your hackathon events</p>
                        </div>
                        <Button variant="gradient" onClick={() => setShowCreateForm(!showCreateForm)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Event
                        </Button>
                    </div>
                </FadeIn>

                {/* Create Event Form */}
                {showCreateForm && (
                    <FadeIn className="mb-8">
                        <Card className="bg-[#111111] border-white/10">
                            <CardHeader>
                                <CardTitle>Create New Event</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={createEvent} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label>Event Title *</Label>
                                        <Input
                                            placeholder="My Awesome Hackathon"
                                            value={newEvent.title}
                                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                            required
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label>Description</Label>
                                        <Input
                                            placeholder="A brief description of your hackathon"
                                            value={newEvent.description}
                                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Location</Label>
                                        <Input
                                            placeholder="San Francisco, CA"
                                            value={newEvent.location}
                                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Max Team Size</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={newEvent.maxTeamSize}
                                            onChange={(e) => setNewEvent({ ...newEvent, maxTeamSize: parseInt(e.target.value) })}
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Start Date *</Label>
                                        <Input
                                            type="datetime-local"
                                            value={newEvent.startDate}
                                            onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                                            required
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date *</Label>
                                        <Input
                                            type="datetime-local"
                                            value={newEvent.endDate}
                                            onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                                            required
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 flex gap-3 justify-end">
                                        <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="gradient" disabled={creating}>
                                            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                                            Create Event
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </FadeIn>
                )}

                {/* Stats Grid */}
                <StaggerChildren className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8" staggerDelay={0.05}>
                    {stats.map((stat) => (
                        <StaggerItem key={stat.label}>
                            <Card className="bg-[#111111] border-white/5 hover:border-white/10 transition-all">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                        </div>
                                        <div>
                                            <p className={`text-2xl font-bold ${stat.color}`}>
                                                <AnimatedCounter value={stat.value} />
                                            </p>
                                            <p className="text-xs text-zinc-500">{stat.label}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    ))}
                </StaggerChildren>

                {/* Events List */}
                <FadeIn delay={0.3}>
                    <h2 className="text-xl font-semibold mb-4">Your Events</h2>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                        </div>
                    ) : events.length === 0 ? (
                        <Card className="bg-[#111111] border-white/5">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <BarChart3 className="h-12 w-12 text-zinc-600 mb-4" />
                                <p className="text-zinc-400 mb-2">No events yet</p>
                                <p className="text-zinc-500 text-sm mb-6">Create your first hackathon event to get started</p>
                                <Button variant="gradient" onClick={() => setShowCreateForm(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Event
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event, i) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card className="bg-[#111111] border-white/5 hover:border-purple-500/30 transition-all group cursor-pointer">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold group-hover:text-purple-300 transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-sm text-zinc-400 mt-1">
                                                        {event.location || "Online"} · {new Date(event.startDate).toLocaleDateString()}
                                                    </p>
                                                    <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                                                        <span>{event._count?.registrations || 0} registrations</span>
                                                        <span>{event._count?.submissions || 0} submissions</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-zinc-400 hover:text-white"
                                                        onClick={() => copyEventLink(event.id, event.slug)}
                                                        title="Copy registration link"
                                                    >
                                                        {copiedId === event.id ? (
                                                            <><Check className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Copied!</>
                                                        ) : (
                                                            <><Copy className="h-3.5 w-3.5 mr-1" /> Copy Link</>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-zinc-400 hover:text-white"
                                                        onClick={() => shareEvent(event)}
                                                        title="Share event"
                                                    >
                                                        <Share2 className="h-3.5 w-3.5 mr-1" /> Share
                                                    </Button>
                                                    <Link href={`/event/${event.slug}`}>
                                                        <Button size="sm" variant="outline">
                                                            <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/dashboard/participants?eventId=${event.id}`}>
                                                        <Button size="sm" variant="gradient">Manage</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </FadeIn>
            </main>
        </div>
    );
}
