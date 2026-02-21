"use client";

import { useState } from "react";
import { HostSidebar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion } from "framer-motion";
import { Trophy, Eye, EyeOff, Medal } from "lucide-react";

export default function ResultsPage() {
    const [isPublic, setIsPublic] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const medals = ["🥇", "🥈", "🥉"];

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <HostSidebar />
            <main className="flex-1 p-4 sm:p-8 overflow-auto">
                <FadeIn>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                                <Trophy className="h-7 w-7 text-yellow-400" />
                                Results
                            </h1>
                            <p className="text-zinc-400 mt-1">View and publish final leaderboard</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Label className="text-sm text-zinc-400">Public</Label>
                            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                            {isPublic ? (
                                <Eye className="h-4 w-4 text-emerald-400" />
                            ) : (
                                <EyeOff className="h-4 w-4 text-zinc-500" />
                            )}
                        </div>
                    </div>
                </FadeIn>

                {results.length === 0 ? (
                    <Card className="bg-[#111111] border-white/5">
                        <CardContent className="flex flex-col items-center py-16">
                            <Trophy className="h-16 w-16 text-zinc-700 mb-4" />
                            <p className="text-zinc-400 text-lg">No results yet</p>
                            <p className="text-zinc-500 text-sm mt-1">
                                Complete the judging rounds to compile results
                            </p>
                            <Button variant="gradient" className="mt-6">
                                Compile Results
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {results.map((result: any, i: number) => (
                            <motion.div
                                key={result.id}
                                initial={{ opacity: 0, rotateX: -90 }}
                                animate={{ opacity: 1, rotateX: 0 }}
                                transition={{ delay: i * 0.2, duration: 0.6, type: "spring" }}
                            >
                                <Card className={`bg-[#111111] border-white/5 ${i < 3 ? "border-yellow-500/30" : ""}`}>
                                    <CardContent className="p-6 flex items-center gap-6">
                                        <div className="text-4xl w-16 text-center">
                                            {i < 3 ? medals[i] : <span className="text-xl text-zinc-500">#{i + 1}</span>}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{result.projectTitle}</h3>
                                            <p className="text-sm text-zinc-400">{result.teamName}</p>
                                        </div>
                                        <div className="text-2xl font-bold text-purple-400">
                                            {result.totalScore}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
