"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HostSidebar } from "@/components/shared/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import {
    Users, Search, CheckCircle, XCircle, Loader2,
    ChevronDown, ChevronUp,
} from "lucide-react";

export default function ParticipantsPage() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
    const [eventId, setEventId] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState("");

    // Auto-detect eventId from URL or fetch first event
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlEventId = params.get("eventId");

        if (urlEventId) {
            setEventId(urlEventId);
        } else {
            // No eventId in URL — fetch user's events and use first one
            fetch("/api/events")
                .then((r) => r.json())
                .then((events) => {
                    if (Array.isArray(events) && events.length > 0) {
                        setEventId(events[0].id);
                        setEventTitle(events[0].title);
                    } else {
                        setLoading(false);
                    }
                })
                .catch(() => setLoading(false));
        }
    }, []);

    const fetchRegistrations = useCallback(async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ eventId });
            if (statusFilter !== "ALL") params.set("status", statusFilter);
            if (search) params.set("search", search);

            const res = await fetch(`/api/registrations?${params}`);
            if (res.ok) {
                const data = await res.json();
                setRegistrations(Array.isArray(data) ? data : []);
            }
        } catch { }
        setLoading(false);
    }, [eventId, statusFilter, search]);

    useEffect(() => {
        if (eventId) fetchRegistrations();
    }, [eventId, fetchRegistrations]);

    const handleAction = async (participantId: string, action: "approve" | "reject") => {
        try {
            const res = await fetch(`/api/participants/${participantId}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (res.ok) {
                fetchRegistrations();
            }
        } catch { }
    };

    const toggleTeam = (id: string) => {
        const updated = new Set(expandedTeams);
        if (updated.has(id)) updated.delete(id);
        else updated.add(id);
        setExpandedTeams(updated);
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge variant="success">Approved</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="warning">Pending</Badge>;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <HostSidebar />
            <main className="flex-1 p-4 sm:p-8 overflow-auto">
                <FadeIn>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                                <Users className="h-7 w-7 text-purple-400" />
                                Participants
                            </h1>
                            <p className="text-zinc-400 mt-1">
                                Manage registrations and approvals
                                {eventTitle && <span className="text-purple-400"> — {eventTitle}</span>}
                            </p>
                        </div>
                    </div>
                </FadeIn>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-[#111111] border-white/10"
                        />
                    </div>
                    <div className="flex gap-2">
                        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                                className={statusFilter === status ? "bg-purple-600" : ""}
                            >
                                {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Registrations */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                ) : registrations.length === 0 ? (
                    <Card className="bg-[#111111] border-white/5">
                        <CardContent className="flex flex-col items-center py-16">
                            <Users className="h-12 w-12 text-zinc-600 mb-4" />
                            <p className="text-zinc-400">
                                {statusFilter !== "ALL"
                                    ? `No ${statusFilter.toLowerCase()} registrations`
                                    : "No registrations yet"}
                            </p>
                            <p className="text-zinc-500 text-sm mt-1">
                                Share your event link to start receiving registrations
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-zinc-400 mb-2">{registrations.length} registration(s)</p>
                        {registrations.map((reg, i) => (
                            <motion.div
                                key={reg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="bg-[#111111] border-white/5 hover:border-white/10 transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                                                    {reg.teamLead?.name?.[0] || "?"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium truncate">{reg.teamLead?.name || "Unknown"}</span>
                                                        {reg.teamName && (
                                                            <span className="text-sm text-cyan-400">({reg.teamName})</span>
                                                        )}
                                                        {reg.participants?.length > 1 && (
                                                            <button
                                                                onClick={() => toggleTeam(reg.id)}
                                                                className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                                                            >
                                                                {reg.participants.length} members
                                                                {expandedTeams.has(reg.id)
                                                                    ? <ChevronUp className="h-3 w-3" />
                                                                    : <ChevronDown className="h-3 w-3" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-zinc-500">{reg.teamLead?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {statusBadge(reg.status)}
                                                {reg.status === "PENDING" && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                                            onClick={() => handleAction(reg.participants?.[0]?.id, "approve")}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                                                            onClick={() => handleAction(reg.participants?.[0]?.id, "reject")}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded team members */}
                                        <AnimatePresence>
                                            {expandedTeams.has(reg.id) && reg.participants?.length > 1 && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden mt-3 pt-3 border-t border-white/5"
                                                >
                                                    <div className="space-y-2 pl-14">
                                                        {reg.participants.map((p: any) => (
                                                            <div key={p.id} className="flex items-center gap-3">
                                                                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold">
                                                                    {p.user?.name?.[0] || "?"}
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm">{p.user?.name || "Unknown"}</span>
                                                                    {p.isTeamLead && (
                                                                        <Badge variant="outline" className="ml-2 text-[10px]">Lead</Badge>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-zinc-500">{p.user?.email}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
