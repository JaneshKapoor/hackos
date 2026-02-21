"use client";

import { useState } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion } from "framer-motion";
import {
    BarChart3, ExternalLink, CheckCircle, Loader2,
    Code, Lightbulb, Zap, Target, Presentation,
} from "lucide-react";

const criteria = [
    { key: "technicalImpl", label: "Technical Implementation", icon: Code, color: "text-purple-400" },
    { key: "techStack", label: "Tech Stack", icon: Zap, color: "text-cyan-400" },
    { key: "innovation", label: "Innovation", icon: Lightbulb, color: "text-yellow-400" },
    { key: "impact", label: "Impact", icon: Target, color: "text-emerald-400" },
    { key: "presentation", label: "Presentation", icon: Presentation, color: "text-pink-400" },
];

export default function JudgeDashboard() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
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

    const total = Object.values(scores).reduce((a, b) => a + b, 0);

    const handleSubmitScore = async () => {
        if (!submissions[currentIndex]) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/judging", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "submit-score",
                    submissionId: submissions[currentIndex].id,
                    round: "PRELIMINARY",
                    ...scores,
                    notes,
                }),
            });
            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    setCurrentIndex((i) => Math.min(i + 1, submissions.length - 1));
                    setScores({ technicalImpl: 5, techStack: 5, innovation: 5, impact: 5, presentation: 5 });
                    setNotes("");
                }, 1500);
            }
        } catch { }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-8">
                <FadeIn>
                    <h1 className="text-2xl font-bold flex items-center gap-3 mb-2">
                        <BarChart3 className="h-6 w-6 text-purple-400" />
                        Judge Dashboard
                    </h1>
                    <p className="text-zinc-400 mb-8">
                        Score submissions across 5 criteria (1-10 each)
                    </p>
                </FadeIn>

                {submissions.length === 0 ? (
                    <FadeIn delay={0.1}>
                        <Card className="bg-[#111111] border-white/5">
                            <CardContent className="flex flex-col items-center py-16">
                                <BarChart3 className="h-16 w-16 text-zinc-600 mb-4" />
                                <p className="text-zinc-400 text-lg">No submissions to judge yet</p>
                                <p className="text-zinc-500 text-sm mt-1">
                                    Submissions will appear here when assigned by the host
                                </p>
                            </CardContent>
                        </Card>
                    </FadeIn>
                ) : (
                    <>
                        {/* Current Submission */}
                        <FadeIn delay={0.1}>
                            <Card className="bg-[#111111] border-white/10 mb-6">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Badge variant="secondary" className="mb-2">
                                                {currentIndex + 1} of {submissions.length}
                                            </Badge>
                                            <CardTitle>{submissions[currentIndex]?.projectTitle}</CardTitle>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold gradient-text">{total}</p>
                                            <p className="text-xs text-zinc-500">/ 50</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-zinc-400 mb-4">
                                        {submissions[currentIndex]?.description}
                                    </p>
                                    <div className="flex gap-3">
                                        {submissions[currentIndex]?.repoUrl && (
                                            <a href={submissions[currentIndex].repoUrl} target="_blank" className="text-xs text-cyan-400 flex items-center gap-1">
                                                <ExternalLink className="h-3 w-3" /> Repo
                                            </a>
                                        )}
                                        {submissions[currentIndex]?.demoUrl && (
                                            <a href={submissions[currentIndex].demoUrl} target="_blank" className="text-xs text-purple-400 flex items-center gap-1">
                                                <ExternalLink className="h-3 w-3" /> Demo
                                            </a>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeIn>

                        {/* Scoring */}
                        <FadeIn delay={0.2}>
                            <Card className="bg-[#111111] border-white/10 mb-6">
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
                                        <Label>Notes (optional)</Label>
                                        <Textarea
                                            placeholder="Any additional feedback..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>

                                    {submitted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="flex items-center justify-center gap-2 py-4 text-emerald-400"
                                        >
                                            <CheckCircle className="h-6 w-6" />
                                            <span className="font-semibold">Score Submitted!</span>
                                        </motion.div>
                                    ) : (
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
                                            Submit Score ({total}/50)
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </FadeIn>
                    </>
                )}
            </main>
        </div>
    );
}
