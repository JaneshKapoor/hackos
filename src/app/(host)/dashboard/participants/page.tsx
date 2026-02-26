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
    ChevronDown, ChevronUp, Trash2, AlertTriangle,
} from "lucide-react";

export default function ParticipantsPage() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
    const [eventId, setEventId] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState("");
    const [events, setEvents] = useState<any[]>([]);
    const [showEventPicker, setShowEventPicker] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    // Fetch all events and auto-select
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlEventId = params.get("eventId");

        fetch("/api/events")
            .then((r) => r.json())
            .then((data) => {
                const evts = Array.isArray(data) ? data : [];
                setEvents(evts);

                if (urlEventId) {
                    setEventId(urlEventId);
                    const found = evts.find((e: any) => e.id === urlEventId);
                    if (found) setEventTitle(found.title);
                } else if (evts.length > 0) {
                    setEventId(evts[0].id);
                    setEventTitle(evts[0].title);
                } else {
                    setLoading(false);
                }
            })
            .catch(() => setLoading(false));
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
            if (res.ok) fetchRegistrations();
        } catch { }
    };

    const confirmDeleteParticipant = async () => {
        if (!deleteTarget) return;
        setDeleting(deleteTarget.id);
        try {
            const res = await fetch(`/api/registrations/${deleteTarget.id}`, {
                method: "DELETE",
            });
            if (res.ok) fetchRegistrations();
        } catch { }
        setDeleting(null);
        setDeleteTarget(null);
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

    const selectEvent = (e: any) => {
        setEventId(e.id);
        setEventTitle(e.title);
        setShowEventPicker(false);
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

                        {/* Event Selector */}
                        {events.length > 1 && (
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowEventPicker(!showEventPicker)}
                                    className="flex items-center gap-2"
                                >
                                    {eventTitle || "Select Event"}
                                    <ChevronDown className={`h-4 w-4 transition-transform ${showEventPicker ? "rotate-180" : ""}`} />
                                </Button>
                                {showEventPicker && (
                                    <div className="absolute top-full mt-2 right-0 w-64 bg-[#111111] border border-white/10 rounded-lg shadow-xl z-30 overflow-hidden">
                                        {events.map((e) => (
                                            <button
                                                key={e.id}
                                                onClick={() => selectEvent(e)}
                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-all border-b border-white/5 last:border-0 ${eventId === e.id ? "text-purple-400 bg-purple-500/5" : "text-zinc-300"}`}
                                            >
                                                <div className="font-medium">{e.title}</div>
                                                <div className="text-xs text-zinc-500 mt-0.5">{e._count?.registrations || 0} registrations</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
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
                                            <div className="flex items-center gap-2">
                                                {statusBadge(reg.status)}
                                                {reg.status === "PENDING" && (
                                                    <div className="flex gap-1">
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
                                                {reg.status === "APPROVED" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                                                        onClick={() => handleAction(reg.participants?.[0]?.id, "reject")}
                                                        title="Revoke approval"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        <span className="text-xs">Reject</span>
                                                    </Button>
                                                )}
                                                {reg.status === "REJECTED" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                                        onClick={() => handleAction(reg.participants?.[0]?.id, "approve")}
                                                        title="Reinstate approval"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        <span className="text-xs">Approve</span>
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-zinc-500 hover:text-red-400"
                                                    onClick={() => setDeleteTarget({ id: reg.id, name: reg.teamLead?.name || reg.teamName || "this participant" })}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
                                                                {p.isPresent && (
                                                                    <Badge variant="success" className="text-[10px]">✅ Present</Badge>
                                                                )}
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

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteTarget(null)}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="relative bg-[#111111] border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                    <AlertTriangle className="h-7 w-7 text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Delete Registration</h3>
                                <p className="text-sm text-zinc-400 mb-6">
                                    Are you sure you want to delete the registration for{" "}
                                    <span className="text-white font-medium">{deleteTarget.name}</span>?
                                    This action cannot be undone.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setDeleteTarget(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                        onClick={confirmDeleteParticipant}
                                        disabled={deleting === deleteTarget.id}
                                    >
                                        {deleting === deleteTarget.id ? (
                                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...</>
                                        ) : (
                                            <><Trash2 className="h-4 w-4 mr-2" /> Delete</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
