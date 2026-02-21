"use client";

import { useState, useEffect, useCallback } from "react";
import { HostSidebar } from "@/components/shared/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import { Gift, Download, Search, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GoodiesPage() {
    const [search, setSearch] = useState("");
    const [goodies, setGoodies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [eventId, setEventId] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState("");
    const [showEventPicker, setShowEventPicker] = useState(false);

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

    // Fetch goodies when event changes
    const fetchGoodies = useCallback(async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/goodies?eventId=${eventId}`);
            if (res.ok) {
                const data = await res.json();
                setGoodies(Array.isArray(data) ? data : []);
            }
        } catch { }
        setLoading(false);
    }, [eventId]);

    useEffect(() => {
        if (eventId) fetchGoodies();
    }, [eventId, fetchGoodies]);

    const filteredGoodies = goodies.filter((g) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            g.participant?.user?.name?.toLowerCase().includes(s) ||
            g.participant?.user?.email?.toLowerCase().includes(s) ||
            g.item?.toLowerCase().includes(s)
        );
    });

    const exportCSV = () => {
        const csv = [
            ["Name", "Email", "Item", "Given At", "Given By"].join(","),
            ...goodies.map((g) =>
                [
                    g.participant?.user?.name || "",
                    g.participant?.user?.email || "",
                    g.item || "",
                    new Date(g.givenAt).toLocaleString(),
                    g.givenByHost?.name || "",
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
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <HostSidebar />
            <main className="flex-1 p-4 sm:p-8 overflow-auto">
                <FadeIn>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                                <Gift className="h-7 w-7 text-purple-400" />
                                Goodies Tracker
                            </h1>
                            <p className="text-zinc-400 mt-1">
                                Track goodie distribution to participants
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
                            <Button variant="outline" size="sm" onClick={exportCSV} disabled={goodies.length === 0}>
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </FadeIn>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search participants or items..."
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
                ) : filteredGoodies.length === 0 ? (
                    <Card className="bg-[#111111] border-white/5">
                        <CardContent className="flex flex-col items-center py-16">
                            <Gift className="h-12 w-12 text-zinc-600 mb-4" />
                            <p className="text-zinc-400">No goodies distributed yet</p>
                            <p className="text-zinc-500 text-sm mt-1">
                                Use the QR scanner to distribute goodies to checked-in participants
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-zinc-400 mb-2">{filteredGoodies.length} item(s) distributed</p>
                        {filteredGoodies.map((g, i) => (
                            <Card key={g.id || i} className="bg-[#111111] border-white/5 hover:border-white/10 transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                                                {g.participant?.user?.name?.[0] || "?"}
                                            </div>
                                            <div>
                                                <p className="font-medium">{g.participant?.user?.name || "Unknown"}</p>
                                                <p className="text-sm text-zinc-500">{g.participant?.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="success">{g.item}</Badge>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                {new Date(g.givenAt).toLocaleString()}
                                            </p>
                                            {g.givenByHost?.name && (
                                                <p className="text-xs text-zinc-600">by {g.givenByHost.name}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
