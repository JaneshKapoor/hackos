"use client";

import { useState, useEffect, useCallback } from "react";
import { HostSidebar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion, AnimatePresence } from "framer-motion";
import {
    ScanLine, UserCheck, Gift, User, Search, CheckCircle, Loader2, X,
    Camera, CameraOff, AlertTriangle, Users, ChevronDown, XCircle,
} from "lucide-react";

export default function ScanPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<string>("");
    const [participants, setParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [filterText, setFilterText] = useState("");

    const [scannedParticipant, setScannedParticipant] = useState<any>(null);
    const [searching, setSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);

    // Camera state
    const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [scannerInstance, setScannerInstance] = useState<any>(null);
    const [cancelCheckinTarget, setCancelCheckinTarget] = useState<{ pid: string; name: string } | null>(null);

    // Fetch events
    useEffect(() => {
        fetch("/api/events")
            .then((r) => r.ok ? r.json() : [])
            .then((data) => {
                const evts = data.events || data || [];
                setEvents(evts);
                if (evts.length > 0) setSelectedEvent(evts[0].id);
            })
            .catch(() => { });
    }, []);

    // Check if camera is available (HTTPS or localhost required)
    useEffect(() => {
        const isSecure = window.location.protocol === "https:" ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";
        if (!isSecure) {
            setCameraAvailable(false);
            setCameraError("Camera requires HTTPS. Use the manual check-in list below, or access via localhost or your Vercel deployment.");
            return;
        }
        if (navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    stream.getTracks().forEach(t => t.stop());
                    setCameraAvailable(true);
                })
                .catch(() => {
                    setCameraAvailable(false);
                    setCameraError("Camera permission denied or not available.");
                });
        } else {
            setCameraAvailable(false);
            setCameraError("Camera is not supported in this browser.");
        }
    }, []);

    // Fetch approved participants for selected event
    const fetchParticipants = useCallback(async () => {
        if (!selectedEvent) return;
        setLoadingParticipants(true);
        try {
            const res = await fetch(`/api/registrations?eventId=${selectedEvent}&status=APPROVED`);
            if (res.ok) {
                const data = await res.json();
                setParticipants(data || []);
            } else {
                setParticipants([]);
            }
        } catch {
            setParticipants([]);
        }
        setLoadingParticipants(false);
    }, [selectedEvent]);

    // Clear old data immediately on event change, then fetch new
    useEffect(() => {
        setParticipants([]);
        setFilterText("");
        setScannedParticipant(null);
        fetchParticipants();
    }, [fetchParticipants]);

    // QR camera scanning
    const startScanning = async () => {
        setCameraError(null);
        try {
            const { Html5Qrcode } = await import("html5-qrcode");
            const scanner = new Html5Qrcode("qr-reader");
            setScannerInstance(scanner);

            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => handleScan(decodedText),
                () => { }
            );
            setIsScanning(true);
        } catch (err: any) {
            setCameraError(err?.message || "Could not access camera. Try the manual check-in below.");
            setIsScanning(false);
        }
    };

    const stopScanning = async () => {
        if (scannerInstance) {
            try {
                await scannerInstance.stop();
                scannerInstance.clear();
            } catch { }
            setScannerInstance(null);
        }
        setIsScanning(false);
    };

    useEffect(() => {
        return () => { stopScanning(); };
    }, []);

    const handleScan = async (data: string) => {
        const token = data.split("/qr/").pop() || data;
        if (!token) return;
        try {
            const res = await fetch(`/api/qr?token=${token}`);
            if (res.ok) {
                const participant = await res.json();
                setScannedParticipant(participant);
            }
        } catch { }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`/api/qr?search=${encodeURIComponent(searchQuery.trim())}`);
            if (res.ok) {
                const participant = await res.json();
                setScannedParticipant(participant);
            }
        } catch { }
        setSearching(false);
    };

    const markPresent = async (participantId?: string) => {
        const pid = participantId || scannedParticipant?.id;
        if (!pid) return;
        setActionLoading(`checkin-${pid}`);
        try {
            const res = await fetch(`/api/participants/${pid}/checkin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "checkin" }),
            });
            if (res.ok) {
                setShowSuccess("Checked In ✅");
                setTimeout(() => setShowSuccess(null), 2000);
                // Update scanned participant if it's the same
                if (scannedParticipant?.id === pid) {
                    setScannedParticipant({ ...scannedParticipant, isPresent: true });
                }
                // Update participant list
                setParticipants((prev) =>
                    prev.map((p) => {
                        const part = p.participants?.[0] || p;
                        if (part.id === pid) {
                            if (p.participants) {
                                return { ...p, participants: [{ ...part, isPresent: true }] };
                            }
                            return { ...part, isPresent: true };
                        }
                        return p;
                    })
                );
            }
        } catch { }
        setActionLoading(null);
    };

    const markGoodie = async (item: string) => {
        if (!scannedParticipant) return;
        setActionLoading("goodie");
        try {
            await fetch("/api/goodies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    participantId: scannedParticipant.id,
                    eventId: scannedParticipant.registration?.event?.id,
                    item,
                }),
            });
            setShowSuccess(`Goodie "${item}" Given 🎁`);
            setTimeout(() => setShowSuccess(null), 2000);
            setScannedParticipant({ ...scannedParticipant, goodieReceived: true });
        } catch { }
        setActionLoading(null);
    };

    // Cancel check-in handler
    const cancelCheckin = async () => {
        if (!cancelCheckinTarget) return;
        setActionLoading(`cancel-${cancelCheckinTarget.pid}`);
        try {
            const res = await fetch(`/api/participants/${cancelCheckinTarget.pid}/checkin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "checkout" }),
            });
            if (res.ok) {
                setShowSuccess("Check-in cancelled ❌");
                setTimeout(() => setShowSuccess(null), 2000);
                // Update scanned participant
                if (scannedParticipant?.id === cancelCheckinTarget.pid) {
                    setScannedParticipant({ ...scannedParticipant, isPresent: false });
                }
                // Update participant list
                setParticipants((prev) =>
                    prev.map((p) => {
                        const part = p.participants?.[0] || p;
                        if (part.id === cancelCheckinTarget.pid) {
                            if (p.participants) {
                                return { ...p, participants: [{ ...part, isPresent: false }] };
                            }
                            return { ...part, isPresent: false };
                        }
                        return p;
                    })
                );
            }
        } catch { }
        setActionLoading(null);
        setCancelCheckinTarget(null);
    };

    // Filter approved participants
    const filteredParticipants = participants.filter((reg) => {
        const name = reg.teamLead?.name || reg.participants?.[0]?.user?.name || "";
        const email = reg.teamLead?.email || reg.participants?.[0]?.user?.email || "";
        const teamName = reg.teamName || "";
        const q = filterText.toLowerCase();
        return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || teamName.toLowerCase().includes(q);
    });

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <HostSidebar />
            <main className="flex-1 p-4 sm:p-8 overflow-auto">
                <FadeIn>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2">
                        <ScanLine className="h-7 w-7 text-purple-400" />
                        Check-in & QR Scanner
                    </h1>
                    <p className="text-zinc-400 mb-6">Scan QR codes or manually check in approved participants</p>

                    {/* Event Selector */}
                    {events.length > 0 && (
                        <div className="mb-6">
                            <label className="text-sm text-zinc-400 mb-1 block">Event</label>
                            <div className="relative w-full max-w-xs">
                                <select
                                    value={selectedEvent}
                                    onChange={(e) => {
                                        setSelectedEvent(e.target.value);
                                    }}
                                    className="w-full appearance-none bg-[#111111] border border-white/10 text-white rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {events.map((ev) => (
                                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>
                    )}
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Scanner + Search */}
                    <div className="space-y-4">
                        {/* QR Scanner */}
                        <Card className="bg-[#111111] border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-base">
                                    <span className="flex items-center gap-2">
                                        <Camera className="h-4 w-4 text-purple-400" />
                                        QR Scanner
                                    </span>
                                    {cameraAvailable && (
                                        <Button
                                            variant={isScanning ? "destructive" : "gradient"}
                                            size="sm"
                                            onClick={isScanning ? stopScanning : startScanning}
                                        >
                                            {isScanning ? (
                                                <><CameraOff className="h-4 w-4 mr-2" /> Stop</>
                                            ) : (
                                                <><Camera className="h-4 w-4 mr-2" /> Start Scanning</>
                                            )}
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {cameraAvailable === false && (
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                                        <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm text-yellow-300 font-medium">Camera unavailable</p>
                                            <p className="text-xs text-zinc-400 mt-1">
                                                {cameraError || "Camera requires HTTPS."}
                                                {" "}Use the participant list below to check in manually by name or email.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {cameraAvailable && (
                                    <>
                                        <div
                                            id="qr-reader"
                                            className="w-full max-w-md mx-auto rounded-lg overflow-hidden"
                                            style={{ minHeight: isScanning ? 300 : 0 }}
                                        />
                                        {cameraError && cameraAvailable && (
                                            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/5 border border-red-500/20 mt-3">
                                                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                                                <p className="text-sm text-red-300">{cameraError}</p>
                                            </div>
                                        )}
                                        {!isScanning && !cameraError && (
                                            <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                                                <Camera className="h-10 w-10 mb-3 opacity-30" />
                                                <p className="text-sm">Click &quot;Start Scanning&quot; to open camera</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Manual Search */}
                        <Card className="bg-[#111111] border-white/10">
                            <CardContent className="pt-6">
                                <form onSubmit={handleSearch} className="flex gap-3">
                                    <Input
                                        placeholder="Search by name, email, or QR token..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-[#0a0a0a] border-white/10"
                                    />
                                    <Button type="submit" variant="outline" disabled={searching}>
                                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Scanned Participant Details */}
                    <AnimatePresence mode="wait">
                        {scannedParticipant ? (
                            <motion.div
                                key={scannedParticipant.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="bg-[#111111] border-white/10 relative overflow-hidden">
                                    <AnimatePresence>
                                        {showSuccess && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="text-2xl font-bold text-emerald-400"
                                                >
                                                    {showSuccess}
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <CardTitle>Participant Details</CardTitle>
                                            <Button variant="ghost" size="icon" onClick={() => setScannedParticipant(null)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-bold shrink-0">
                                                {scannedParticipant.user?.name?.[0] || "?"}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold">{scannedParticipant.user?.name}</h3>
                                                <p className="text-sm text-zinc-400">{scannedParticipant.user?.email}</p>
                                                {scannedParticipant.registration?.teamName && (
                                                    <span className="text-xs text-cyan-400">Team: {scannedParticipant.registration.teamName}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant={scannedParticipant.registration?.status === "APPROVED" ? "success" : "warning"}>
                                                {scannedParticipant.registration?.status}
                                            </Badge>
                                            <Badge variant={scannedParticipant.isPresent ? "success" : "secondary"}>
                                                {scannedParticipant.isPresent ? "✅ Present" : "Not checked in"}
                                            </Badge>
                                            <Badge variant={scannedParticipant.goodieReceived ? "success" : "secondary"}>
                                                {scannedParticipant.goodieReceived ? "🎁 Goodie received" : "No goodie yet"}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3">
                                            <Button
                                                variant="gradient"
                                                className="w-full"
                                                onClick={() => markPresent()}
                                                disabled={actionLoading === `checkin-${scannedParticipant.id}` || scannedParticipant.isPresent}
                                            >
                                                {actionLoading === `checkin-${scannedParticipant.id}` ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <UserCheck className="h-4 w-4 mr-2" />
                                                )}
                                                {scannedParticipant.isPresent ? "Already Checked In" : "Mark Present ✅"}
                                            </Button>

                                            <div className="grid grid-cols-2 gap-3">
                                                {["Goodie Pack", "T-Shirt", "Stickers", "Laptop Bag"].map((item) => (
                                                    <Button
                                                        key={item}
                                                        variant="outline"
                                                        onClick={() => markGoodie(item)}
                                                        disabled={actionLoading === "goodie"}
                                                    >
                                                        <Gift className="h-4 w-4 mr-2" />
                                                        {item}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {scannedParticipant.goodieLogs?.length > 0 && (
                                            <div>
                                                <p className="text-sm text-zinc-400 mb-2">Previously Given:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {scannedParticipant.goodieLogs.map((log: any, i: number) => (
                                                        <Badge key={i} variant="secondary">
                                                            {log.item} · {new Date(log.givenAt).toLocaleTimeString()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Card className="bg-[#111111] border-white/5 h-full flex items-center justify-center min-h-[300px]">
                                    <CardContent className="text-center py-12">
                                        <User className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                                        <p className="text-zinc-400 text-lg mb-1">No participant selected</p>
                                        <p className="text-zinc-500 text-sm">
                                            Scan a QR code, search above, or click a participant below
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Approved Participants List */}
                <FadeIn>
                    <Card className="bg-[#111111] border-white/10 mt-8">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Users className="h-5 w-5 text-purple-400" />
                                    Approved Participants
                                    <Badge variant="secondary" className="ml-2">{filteredParticipants.length}</Badge>
                                </CardTitle>
                                <Input
                                    placeholder="Filter by name, email, or team..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="bg-[#0a0a0a] border-white/10 w-full sm:max-w-xs"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingParticipants ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                                </div>
                            ) : filteredParticipants.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500">
                                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p>No approved participants found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {filteredParticipants.map((reg) => {
                                        const participant = reg.participants?.[0];
                                        const user = reg.teamLead || participant?.user || {};
                                        const isPresent = participant?.isPresent;
                                        const pid = participant?.id;
                                        const isCheckingIn = actionLoading === `checkin-${pid}`;

                                        return (
                                            <div
                                                key={reg.id || pid}
                                                className="flex items-center justify-between py-3 px-2 hover:bg-white/[0.02] rounded-lg transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                                                        {user.name?.[0] || "?"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm truncate">{user.name || "Unknown"}</p>
                                                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                                        {reg.teamName && (
                                                            <p className="text-xs text-cyan-400/70">{reg.teamName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {isPresent ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setCancelCheckinTarget({ pid: pid!, name: user.name || "this participant" })}
                                                            className="text-xs h-8 text-emerald-400 border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors"
                                                            disabled={actionLoading === `cancel-${pid}`}
                                                        >
                                                            {actionLoading === `cancel-${pid}` ? (
                                                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                            ) : (
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                            )}
                                                            Present
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="gradient"
                                                            onClick={() => markPresent(pid)}
                                                            disabled={isCheckingIn}
                                                            className="text-xs h-8"
                                                        >
                                                            {isCheckingIn ? (
                                                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                            ) : (
                                                                <UserCheck className="h-3 w-3 mr-1" />
                                                            )}
                                                            Check In
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            </main>

            {/* Cancel Check-in Confirmation Modal */}
            <AnimatePresence>
                {cancelCheckinTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setCancelCheckinTarget(null)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="relative bg-[#111111] border border-yellow-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                                    <AlertTriangle className="h-7 w-7 text-yellow-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Cancel Check-in</h3>
                                <p className="text-sm text-zinc-400 mb-6">
                                    Are you sure you want to cancel the check-in for{" "}
                                    <span className="text-white font-medium">{cancelCheckinTarget.name}</span>?
                                    They will be marked as not present.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setCancelCheckinTarget(null)}
                                    >
                                        Keep Checked In
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                                        onClick={cancelCheckin}
                                        disabled={actionLoading === `cancel-${cancelCheckinTarget.pid}`}
                                    >
                                        {actionLoading === `cancel-${cancelCheckinTarget.pid}` ? (
                                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Cancelling...</>
                                        ) : (
                                            <><XCircle className="h-4 w-4 mr-2" /> Cancel Check-in</>
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
