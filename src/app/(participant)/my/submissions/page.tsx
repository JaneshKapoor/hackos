"use client";

import { useState } from "react";
import { ParticipantBottomNav, Navbar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion } from "framer-motion";
import { Code, Loader2, CheckCircle, ExternalLink, Send } from "lucide-react";

export default function MySubmissionsPage() {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        projectTitle: "",
        description: "",
        repoUrl: "",
        demoUrl: "",
        presentationUrl: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // In production, get registrationId and eventId from session
            const res = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    registrationId: "demo",
                    eventId: "demo",
                }),
            });
            if (res.ok) setSubmitted(true);
        } catch { }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-20 lg:pb-0">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-8">
                <FadeIn>
                    <h1 className="text-2xl font-bold flex items-center gap-3 mb-2">
                        <Code className="h-6 w-6 text-purple-400" />
                        My Submission
                    </h1>
                    <p className="text-zinc-400 mb-8">Submit your hackathon project</p>
                </FadeIn>

                {submitted ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="bg-emerald-500/10 border-emerald-500/20">
                            <CardContent className="flex flex-col items-center py-12">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", bounceat: 0.5, delay: 0.2 }}
                                >
                                    <CheckCircle className="h-16 w-16 text-emerald-400 mb-4" />
                                </motion.div>
                                <h2 className="text-xl font-bold text-emerald-300 mb-2">Submitted! 🎉</h2>
                                <p className="text-zinc-400 text-sm text-center">
                                    Your project has been submitted successfully. Good luck!
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <FadeIn delay={0.1}>
                        <Card className="bg-[#111111] border-white/10">
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Project Title *</Label>
                                        <Input
                                            placeholder="My Amazing Project"
                                            value={formData.projectTitle}
                                            onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                                            required
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description *</Label>
                                        <Textarea
                                            placeholder="Describe your project, the problem it solves, and how it works..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                            className="bg-[#0a0a0a] border-white/10 min-h-[120px]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>GitHub Repo URL</Label>
                                            <Input
                                                placeholder="https://github.com/..."
                                                value={formData.repoUrl}
                                                onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                                                className="bg-[#0a0a0a] border-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Demo URL</Label>
                                            <Input
                                                placeholder="https://my-demo.vercel.app"
                                                value={formData.demoUrl}
                                                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                                                className="bg-[#0a0a0a] border-white/10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Presentation / Deck URL</Label>
                                        <Input
                                            placeholder="https://docs.google.com/presentation/..."
                                            value={formData.presentationUrl}
                                            onChange={(e) => setFormData({ ...formData, presentationUrl: e.target.value })}
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        className="w-full"
                                        disabled={submitting || !formData.projectTitle || !formData.description}
                                    >
                                        {submitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Send className="h-4 w-4 mr-2" />
                                        )}
                                        Submit Project
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </FadeIn>
                )}
            </main>
            <ParticipantBottomNav />
        </div>
    );
}
