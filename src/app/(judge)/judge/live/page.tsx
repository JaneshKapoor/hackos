"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion, AnimatePresence } from "framer-motion";
import {
    Radio, Loader2, CheckCircle, Clock,
    Code, Lightbulb, Zap, Target, Presentation,
} from "lucide-react";

const criteria = [
    { key: "technicalImpl", label: "Technical Implementation", icon: Code, color: "text-purple-400" },
    { key: "techStack", label: "Tech Stack", icon: Zap, color: "text-cyan-400" },
    { key: "innovation", label: "Innovation", icon: Lightbulb, color: "text-yellow-400" },
    { key: "impact", label: "Impact", icon: Target, color: "text-emerald-400" },
    { key: "presentation", label: "Presentation", icon: Presentation, color: "text-pink-400" },
];

export default function LiveJudgingPage() {
    const [activeTeam, setActiveTeam] = useState<any>(null);
    const [waiting, setWaiting] = useState(true);
    const [scores, setScores] = useState<Record<string, number>>({
        technicalImpl: 5,
        techStack: 5,
        innovation: 5,
        impact: 5,
        presentation: 5,
    });
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Poll for active team every 3 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // In production, poll the event for currentPitchTeamId
                // const res = await fetch('/api/judging?eventId=xxx&action=current-pitch');
            } catch { }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const total = Object.values(scores).reduce((a, b) => a + b, 0);

    const handleSubmitScore = async () => {
        if (!activeTeam) return;
        setSubmitting(true);
        try {
            await fetch("/api/judging", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "submit-score",
                    submissionId: activeTeam.id,
                    round: "FINAL",
                    ...scores,
                    notes,
                }),
            });
            setSubmitted(true);
        } catch { }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-8">
                <FadeIn>
                    <h1 className="text-2xl font-bold flex items-center gap-3 mb-2">
                        <Radio className="h-6 w-6 text-red-400 animate-pulse" />
                        Live Pitching
                    </h1>
                    <p className="text-zinc-400 mb-8">Score teams as they present live</p>
                </FadeIn>

                <AnimatePresence mode="wait">
                    {!activeTeam ? (
                        <motion.div
                            key="waiting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Card className="bg-[#111111] border-white/5">
                                <CardContent className="flex flex-col items-center py-20">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        <Clock className="h-16 w-16 text-zinc-600 mb-6" />
                                    </motion.div>
                                    <p className="text-zinc-400 text-lg mb-2">Waiting for next team...</p>
                                    <p className="text-zinc-500 text-sm">
                                        The host will activate teams one at a time
                                    </p>
                                    <div className="flex gap-1 mt-6">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-2 h-2 rounded-full bg-purple-500"
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : submitted ? (
                        <motion.div
                            key="submitted"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="bg-emerald-500/10 border-emerald-500/20">
                                <CardContent className="flex flex-col items-center py-16">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.5 }}
                                    >
                                        <CheckCircle className="h-20 w-20 text-emerald-400 mb-6" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-emerald-300 mb-2">Score Submitted!</h2>
                                    <p className="text-zinc-400">Waiting for the host to advance to the next team...</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`team-${activeTeam.id}`}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ type: "spring", bounce: 0.3 }}
                        >
                            <Card className="bg-[#111111] border-purple-500/20 mb-6">
                                <CardHeader>
                                    <Badge variant="default" className="w-fit mb-2 bg-red-500 animate-pulse">
                                        🔴 NOW PITCHING
                                    </Badge>
                                    <CardTitle className="text-2xl">{activeTeam.projectTitle}</CardTitle>
                                    <p className="text-sm text-cyan-400">{activeTeam.teamName}</p>
                                </CardHeader>
                            </Card>

                            <Card className="bg-[#111111] border-white/10">
                                <CardContent className="pt-6 space-y-6">
                                    {criteria.map((c) => (
                                        <div key={c.key} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className={`flex items-center gap-2 ${c.color}`}>
                                                    <c.icon className="h-4 w-4" />
                                                    {c.label}
                                                </Label>
                                                <span className="text-lg font-bold">{scores[c.key]}</span>
                                            </div>
                                            <Slider
                                                min={1}
                                                max={10}
                                                step={1}
                                                value={[scores[c.key]]}
                                                onValueChange={([val]) => setScores({ ...scores, [c.key]: val })}
                                            />
                                        </div>
                                    ))}

                                    <div className="space-y-2">
                                        <Label>Notes</Label>
                                        <Textarea
                                            placeholder="Optional feedback..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>

                                    <Button
                                        variant="gradient"
                                        className="w-full"
                                        onClick={handleSubmitScore}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Lock In Score ({total}/50)
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
