"use client";

import { useState, useCallback } from "react";
import { HostSidebar } from "@/components/shared/Navbar";
import { QRScanner } from "@/components/shared/QRScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion, AnimatePresence } from "framer-motion";
import {
    ScanLine, UserCheck, Gift, User, Search, CheckCircle, Loader2, X,
} from "lucide-react";

export default function ScanPage() {
    const [scannedParticipant, setScannedParticipant] = useState<any>(null);
    const [searching, setSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);

    const handleScan = useCallback(async (data: string) => {
        // Extract token from QR URL
        const token = data.split("/qr/").pop() || data;
        if (!token) return;

        try {
            const res = await fetch(`/api/qr?token=${token}`);
            if (res.ok) {
                const participant = await res.json();
                setScannedParticipant(participant);
            }
        } catch { }
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        // In a real app, add a search API. For now, use QR token search
        try {
            const res = await fetch(`/api/qr?token=${searchQuery.trim()}`);
            if (res.ok) {
                const participant = await res.json();
                setScannedParticipant(participant);
            }
        } catch { }
        setSearching(false);
    };

    const markPresent = async () => {
        if (!scannedParticipant) return;
        setActionLoading("checkin");
        try {
            await fetch(`/api/participants/${scannedParticipant.id}/checkin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "checkin" }),
            });
            setShowSuccess("Checked In ✅");
            setTimeout(() => setShowSuccess(null), 2000);
            setScannedParticipant({ ...scannedParticipant, isPresent: true });
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

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <HostSidebar />
            <main className="flex-1 p-4 sm:p-8 overflow-auto">
                <FadeIn>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2">
                        <ScanLine className="h-7 w-7 text-purple-400" />
                        QR Scanner
                    </h1>
                    <p className="text-zinc-400 mb-8">Scan participant QR codes for check-in and goodies</p>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Scanner */}
                    <div className="space-y-4">
                        <QRScanner onScan={handleScan} />

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

                    {/* Participant Info */}
                    <AnimatePresence mode="wait">
                        {scannedParticipant ? (
                            <motion.div
                                key={scannedParticipant.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="bg-[#111111] border-white/10 relative overflow-hidden">
                                    {/* Success overlay */}
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setScannedParticipant(null)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Profile */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-bold">
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

                                        {/* Status */}
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

                                        {/* Actions */}
                                        <div className="space-y-3">
                                            <Button
                                                variant="gradient"
                                                className="w-full"
                                                onClick={markPresent}
                                                disabled={actionLoading === "checkin" || scannedParticipant.isPresent}
                                            >
                                                {actionLoading === "checkin" ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <UserCheck className="h-4 w-4 mr-2" />
                                                )}
                                                {scannedParticipant.isPresent ? "Already Checked In" : "Mark Present ✅"}
                                            </Button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => markGoodie("Goodie Pack")}
                                                    disabled={actionLoading === "goodie"}
                                                >
                                                    <Gift className="h-4 w-4 mr-2" />
                                                    Goodie Pack
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => markGoodie("T-Shirt")}
                                                    disabled={actionLoading === "goodie"}
                                                >
                                                    🎽 T-Shirt
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => markGoodie("Stickers")}
                                                    disabled={actionLoading === "goodie"}
                                                >
                                                    🏷️ Stickers
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => markGoodie("Laptop Bag")}
                                                    disabled={actionLoading === "goodie"}
                                                >
                                                    💼 Laptop Bag
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Previous Goodies */}
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
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Card className="bg-[#111111] border-white/5 h-full flex items-center justify-center min-h-[400px]">
                                    <CardContent className="text-center py-12">
                                        <User className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                                        <p className="text-zinc-400 text-lg mb-1">No participant scanned</p>
                                        <p className="text-zinc-500 text-sm">
                                            Scan a QR code or search manually to view participant details
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
