"use client";

import { useState } from "react";
import { HostSidebar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/animations/FadeIn";
import { Code, ExternalLink, Clock, Loader2 } from "lucide-react";

export default function SubmissionsPage() {
    const [submissionsOpen, setSubmissionsOpen] = useState(false);
    const [submissions, setSubmissions] = useState<any[]>([]);

    const toggleSubmissions = async () => {
        setSubmissionsOpen(!submissionsOpen);
        // In production, call API to toggle event.submissionsOpen
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <HostSidebar />
            <main className="flex-1 p-4 sm:p-8 overflow-auto">
                <FadeIn>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                                <Code className="h-7 w-7 text-purple-400" />
                                Submissions
                            </h1>
                            <p className="text-zinc-400 mt-1">Manage project submissions</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Label className="text-sm text-zinc-400">Submissions</Label>
                            <Switch checked={submissionsOpen} onCheckedChange={toggleSubmissions} />
                            <Badge variant={submissionsOpen ? "success" : "secondary"}>
                                {submissionsOpen ? "Open" : "Closed"}
                            </Badge>
                        </div>
                    </div>
                </FadeIn>

                {submissions.length === 0 ? (
                    <Card className="bg-[#111111] border-white/5">
                        <CardContent className="flex flex-col items-center py-16">
                            <Code className="h-12 w-12 text-zinc-600 mb-4" />
                            <p className="text-zinc-400">No submissions yet</p>
                            <p className="text-zinc-500 text-sm mt-1 text-center">
                                {submissionsOpen
                                    ? "Waiting for teams to submit their projects"
                                    : "Open submissions to allow teams to submit projects"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {submissions.map((sub: any) => (
                            <Card key={sub.id} className="bg-[#111111] border-white/5 hover:border-white/10 transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{sub.projectTitle}</h3>
                                            <p className="text-sm text-zinc-400 mt-1">{sub.description}</p>
                                            <div className="flex gap-3 mt-3">
                                                {sub.repoUrl && (
                                                    <a href={sub.repoUrl} target="_blank" className="text-xs text-cyan-400 flex items-center gap-1">
                                                        <ExternalLink className="h-3 w-3" /> Repo
                                                    </a>
                                                )}
                                                {sub.demoUrl && (
                                                    <a href={sub.demoUrl} target="_blank" className="text-xs text-purple-400 flex items-center gap-1">
                                                        <ExternalLink className="h-3 w-3" /> Demo
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant="success">Submitted</Badge>
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
