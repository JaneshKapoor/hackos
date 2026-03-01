"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import {
    Gift, Download, Search, Loader2, ChevronDown,
    UserCheck, Package,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GoodiesPage() {
    const [search, setSearch] = useState("");
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [eventId, setEventId] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState("");
    const [showEventPicker, setShowEventPicker] = useState(false);
    const [distributing, setDistributing] = useState<string | null>(null);

    // Fetch events and auto-select first
    useEffect(() => {
        fetch("/api/events")
            .then((r) => r.json())
            .then((data) => {
                const evts = Array.isArray(data) ? data : [];
                setEvents(evts);
                if (evts.length > 0) {
                    setEventId(evts[0].id);
                    setEventTitle(evts[0].title);
                } else {
                    setLoading(false);
                }
            })
            .catch(() => setLoading(false));
    }, []);

    // Fetch checked-in participants for the selected event
    const fetchCheckedIn = useCallback(async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/goodies/checkedin?eventId=${eventId}`);
            if (res.ok) {
                const data = await res.json();
                setParticipants(Array.isArray(data) ? data : []);
            }
        } catch { }
        setLoading(false);
    }, [eventId]);

    useEffect(() => {
        if (eventId) fetchCheckedIn();
    }, [eventId, fetchCheckedIn]);

    // Give goodie to a participant
    const giveGoodie = async (participantId: string) => {
        setDistributing(participantId);
        try {
            const res = await fetch("/api/goodies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    participantId,
                    eventId,
                    item: "Goodie Pack",
                }),
            });
            if (res.ok) {
                fetchCheckedIn(); // Refresh the list
            }
        } catch { }
        setDistributing(null);
    };

    // Filter participants by search
    const filtered = participants.filter((p) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            p.user?.name?.toLowerCase().includes(s) ||
            p.user?.email?.toLowerCase().includes(s)
        );
    });

    const checkedInCount = filtered.length;
    const goodieGivenCount = filtered.filter((p) => p.goodieReceived).length;

    const exportCSV = () => {
        const csv = [
            ["Name", "Email", "Checked In", "Goodie Received", "Team"].join(","),
            ...filtered.map((p) =>
                [
                    p.user?.name || "",
                    p.user?.email || "",
                    p.isPresent ? "Yes" : "No",
                    p.goodieReceived ? "Yes" : "No",
                    p.registration?.teamName || "Solo",
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `goodies-${eventTitle}-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <FadeIn>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                            <Gift className="h-7 w-7 text-purple-400" />
                            Goodies Tracker
                        </h1>
                        <p className="text-zinc-400 mt-1">
                            Checked-in participants & goodie distribution
                            {eventTitle && <span className="text-purple-400"> — {eventTitle}</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {events.length > 1 && (
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowEventPicker(!showEventPicker)}
                                >
                                    {eventTitle || "Select Event"}
                                    <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showEventPicker ? "rotate-180" : ""}`} />
                                </Button>
                                {showEventPicker && (
                                    <div className="absolute top-full mt-2 right-0 w-64 bg-[#111111] border border-white/10 rounded-lg shadow-xl z-30 overflow-hidden">
                                        {events.map((e) => (
                                            <button
                                                key={e.id}
                                                onClick={() => {
                                                    setEventId(e.id);
                                                    setEventTitle(e.title);
                                                    setShowEventPicker(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 border-b border-white/5 last:border-0 ${eventId === e.id ? "text-purple-400 bg-purple-500/5" : "text-zinc-300"}`}
                                            >
                                                {e.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <Button variant="outline" size="sm" onClick={exportCSV} disabled={participants.length === 0}>
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>
            </FadeIn>

            {/* Stats summary */}
            {!loading && participants.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="bg-[#111111] border-white/5">
                        <CardContent className="pt-4 pb-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-emerald-500/10">
                                <UserCheck className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-400">{checkedInCount}</p>
                                <p className="text-xs text-zinc-500">Checked In</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111111] border-white/5">
                        <CardContent className="pt-4 pb-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-purple-500/10">
                                <Package className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-400">{goodieGivenCount}</p>
                                <p className="text-xs text-zinc-500">Goodies Distributed</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search participants..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-[#111111] border-white/10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
            ) : filtered.length === 0 ? (
                <Card className="bg-[#111111] border-white/5">
                    <CardContent className="flex flex-col items-center py-16">
                        <Gift className="h-12 w-12 text-zinc-600 mb-4" />
                        <p className="text-zinc-400">No checked-in participants yet</p>
                        <p className="text-zinc-500 text-sm mt-1">
                            Use the QR scanner to check in participants first
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filtered.map((p, i) => (
                        <Card key={p.id} className="bg-[#111111] border-white/5 hover:border-white/10 transition-all">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                                            {p.user?.name?.[0] || "?"}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{p.user?.name || "Unknown"}</p>
                                                {p.registration?.teamName && (
                                                    <span className="text-xs text-cyan-400">({p.registration.teamName})</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-500">{p.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="success" className="text-xs">
                                            <UserCheck className="h-3 w-3 mr-1" />
                                            Present
                                        </Badge>
                                        {p.goodieReceived ? (
                                            <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                                                <Gift className="h-3 w-3 mr-1" />
                                                Received
                                            </Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="gradient"
                                                onClick={() => giveGoodie(p.id)}
                                                disabled={distributing === p.id}
                                            >
                                                {distributing === p.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Gift className="h-3.5 w-3.5 mr-1" />
                                                        Give Goodie
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
}
