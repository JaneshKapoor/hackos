"use client";

import { useState } from "react";
import { HostSidebar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion } from "framer-motion";
import { BarChart3, UserPlus, Send, Loader2, Play, SkipForward } from "lucide-react";

export default function JudgingPage() {
    const [judgeEmail, setJudgeEmail] = useState("");
    const [addingJudge, setAddingJudge] = useState(false);
    const [judges, setJudges] = useState<any[]>([]);
    const [livePitching, setLivePitching] = useState(false);

    const addJudge = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddingJudge(true);
        try {
            const eventId = new URLSearchParams(window.location.search).get("eventId");
            const res = await fetch("/api/judging", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "add-judge", eventId, judgeEmail }),
            });
            if (res.ok) {
                setJudgeEmail("");
                // Refresh judges list
            }
        } catch { }
        setAddingJudge(false);
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <HostSidebar />
            <main className="flex-1 p-4 sm:p-8 overflow-auto">
                <FadeIn>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2">
                        <BarChart3 className="h-7 w-7 text-purple-400" />
                        Judging
                    </h1>
                    <p className="text-zinc-400 mb-8">Manage judges and scoring</p>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Judge */}
                    <FadeIn delay={0.1}>
                        <Card className="bg-[#111111] border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" /> Add Judge
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={addJudge} className="flex gap-3">
                                    <Input
                                        type="email"
                                        placeholder="judge@example.com"
                                        value={judgeEmail}
                                        onChange={(e) => setJudgeEmail(e.target.value)}
                                        required
                                        className="bg-[#0a0a0a] border-white/10"
                                    />
                                    <Button type="submit" variant="gradient" disabled={addingJudge}>
                                        {addingJudge ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </form>
                                <p className="text-xs text-zinc-500 mt-2">
                                    Judge will receive a magic link email to access the judging dashboard
                                </p>
                            </CardContent>
                        </Card>
                    </FadeIn>

                    {/* Live Pitching Controls */}
                    <FadeIn delay={0.2}>
                        <Card className="bg-[#111111] border-white/10">
                            <CardHeader>
                                <CardTitle>Live Pitching</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-zinc-400">
                                    Start the live pitching round. Judges will see teams appear one at a time for scoring.
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="gradient"
                                        className="flex-1"
                                        disabled={livePitching}
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        Start Pitching
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={!livePitching}
                                    >
                                        <SkipForward className="h-4 w-4 mr-2" />
                                        Next Team
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </FadeIn>
                </div>

                {/* Judges List */}
                <FadeIn delay={0.3} className="mt-6">
                    <Card className="bg-[#111111] border-white/5">
                        <CardHeader>
                            <CardTitle>Judges ({judges.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {judges.length === 0 ? (
                                <div className="text-center py-8">
                                    <BarChart3 className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                                    <p className="text-zinc-400 text-sm">No judges added yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {judges.map((judge: any) => (
                                        <div key={judge.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a]">
                                            <span>{judge.judgeEmail}</span>
                                            <Badge variant="success">Active</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            </main>
        </div>
    );
}
