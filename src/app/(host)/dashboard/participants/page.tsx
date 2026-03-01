"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import {
    Users, Search, CheckCircle, XCircle, Loader2,
    ChevronDown, Trash2, AlertTriangle, ExternalLink, Linkedin, Download,
} from "lucide-react";


export default function ParticipantsPage() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [eventId, setEventId] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState("");
    const [events, setEvents] = useState<any[]>([]);
    const [showEventPicker, setShowEventPicker] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    // Debounce search input — wait 300ms after typing stops before querying
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

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
            if (debouncedSearch) params.set("search", debouncedSearch);

            const res = await fetch(`/api/registrations?${params}`);
            if (res.ok) {
                const data = await res.json();
                setRegistrations(Array.isArray(data) ? data : []);
            } else {
                setRegistrations([]);
            }
        } catch {
            setRegistrations([]);
        }
        setLoading(false);
    }, [eventId, statusFilter, debouncedSearch]);

    // Clear old data immediately on event/filter change, then fetch new
    useEffect(() => {
        if (eventId) {
            setRegistrations([]);
            fetchRegistrations();
        }
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

    const selectEvent = (e: any) => {
        setEventId(e.id);
        setEventTitle(e.title);
        setShowEventPicker(false);
    };

    const exportToCSV = async () => {
        if (!eventId) return;

        const params = new URLSearchParams({ eventId });
        if (statusFilter !== "ALL") params.set("status", statusFilter);
        if (search) params.set("search", search);

        const res = await fetch(`/api/registrations/export?${params}`);
        const blob = await res.blob();

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Custom filename with filter label
        const filterLabel = statusFilter !== "ALL" ? `_${statusFilter.toLowerCase()}` : "";
        a.download = `${eventTitle || "participants"}${filterLabel}_participants.csv`;

        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
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
        <>
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

                    <div className="flex items-center gap-3">

                        {/* Event Selector */}
                        {events.length > 0 && (
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

                        {/* Export CSV Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportToCSV}
                            disabled={registrations.length === 0 || loading}
                            className="flex items-center gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
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

            {/* Registrations Table */}
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
                <div className="mb-4">
                    <p className="text-sm text-zinc-400 mb-4">{registrations.length} registration(s)</p>
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-[#0d0d0d]">
                                    <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Participant</th>
                                    <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden lg:table-cell">LinkedIn</th>
                                    <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden xl:table-cell">Bio</th>
                                    <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Checked In</th>
                                    <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {registrations.map((reg, i) => {
                                    const participant = reg.participants?.[0];
                                    const user = reg.teamLead || participant?.user || {};
                                    const selfie = participant?.selfieUrl;
                                    const linkedin = participant?.linkedinUrl;
                                    const bio = participant?.bio;

                                    return (
                                        <motion.tr
                                            key={reg.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="bg-[#111111] hover:bg-white/[0.03] transition-colors group"
                                        >
                                            {/* Participant - Selfie + Name + Team */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {selfie ? (
                                                        <img
                                                            src={selfie}
                                                            alt={user.name || "Selfie"}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-white/10 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/40 to-cyan-500/40 flex items-center justify-center text-sm font-bold shrink-0">
                                                            {user.name?.[0] || "?"}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm text-white truncate">{user.name || "Unknown"}</p>
                                                        {reg.teamName && (
                                                            <p className="text-xs text-cyan-400/80 truncate">{reg.teamName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-4 py-3.5">
                                                <p className="text-sm text-zinc-400 truncate max-w-[200px]">{user.email}</p>
                                            </td>

                                            {/* LinkedIn */}
                                            <td className="px-4 py-3.5 hidden lg:table-cell">
                                                {linkedin ? (
                                                    <a
                                                        href={linkedin}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                                    >
                                                        <Linkedin className="h-3.5 w-3.5" />
                                                        <span className="truncate max-w-[120px]">Profile</span>
                                                        <ExternalLink className="h-3 w-3 opacity-50" />
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-zinc-600">—</span>
                                                )}
                                            </td>

                                            {/* Bio */}
                                            <td className="px-4 py-3.5 hidden xl:table-cell">
                                                {bio ? (
                                                    <p className="text-xs text-zinc-400 line-clamp-2 max-w-[200px]" title={bio}>
                                                        {bio}
                                                    </p>
                                                ) : (
                                                    <span className="text-xs text-zinc-600">—</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                {statusBadge(reg.status)}
                                            </td>

                                            {/* Checked In */}
                                            <td className="px-4 py-3.5">
                                                {participant?.isPresent ? (
                                                    <Badge variant="success" className="text-[10px]">
                                                        ✅ Present
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-zinc-600">—</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    {reg.status === "PENDING" && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 h-8"
                                                                onClick={() => handleAction(participant?.id, "approve")}
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                                <span className="text-xs">Approve</span>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-400 border-red-500/30 hover:bg-red-500/10 h-8"
                                                                onClick={() => handleAction(participant?.id, "reject")}
                                                                title="Reject"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                                                <span className="text-xs">Reject</span>
                                                            </Button>
                                                        </>
                                                    )}
                                                    {reg.status === "APPROVED" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-400 border-red-500/30 hover:bg-red-500/10 h-8"
                                                            onClick={() => handleAction(participant?.id, "reject")}
                                                            title="Revoke approval"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5 mr-1" />
                                                            <span className="text-xs">Reject</span>
                                                        </Button>
                                                    )}
                                                    {reg.status === "REJECTED" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 h-8"
                                                            onClick={() => handleAction(participant?.id, "approve")}
                                                            title="Reinstate"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                            <span className="text-xs">Approve</span>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-zinc-500 hover:text-red-400 h-8"
                                                        onClick={() => setDeleteTarget({ id: reg.id, name: user.name || reg.teamName || "this participant" })}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
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
        </>
    );
}
