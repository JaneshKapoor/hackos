"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";
import { Brain, Loader2, Sparkles, Users } from "lucide-react";

export default function NetworkingPage() {
    const [running, setRunning] = useState(false);
    const [matchResult, setMatchResult] = useState<any>(null);

    const runMatching = async () => {
        setRunning(true);
        try {
            const eventId = new URLSearchParams(window.location.search).get("eventId");
            const res = await fetch("/api/networking/match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId }),
            });
            if (res.ok) {
                const data = await res.json();
                setMatchResult(data);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to run matching");
            }
        } catch { }
        setRunning(false);
    };

    return (
        <>
            <FadeIn>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2">
                    <Brain className="h-7 w-7 text-purple-400" />
                    AI Networking
                </h1>
                <p className="text-zinc-400 mb-8">
                    Use AI to match participants with complementary skills and interests
                </p>
            </FadeIn>

            <div className="max-w-xl">
                <Card className="bg-[#111111] border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                            AI-Powered Matching
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-zinc-400">
                            OpenAI will analyze all present participants&apos; bios and LinkedIn profiles
                            to suggest the best networking pairs based on complementary skills.
                        </p>

                        <Button
                            variant="gradient"
                            className="w-full"
                            onClick={runMatching}
                            disabled={running}
                        >
                            {running ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Running AI Matching...
                                </>
                            ) : (
                                <>
                                    <Brain className="h-4 w-4 mr-2" />
                                    Run AI Matching
                                </>
                            )}
                        </Button>

                        {matchResult && (
                            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-emerald-400 font-medium">
                                    ✅ Created {matchResult.matchesCreated} new matches!
                                </p>
                                <p className="text-sm text-zinc-400 mt-1">
                                    Participants have been notified via email
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
