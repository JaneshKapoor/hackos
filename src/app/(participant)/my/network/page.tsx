"use client";

import { useState } from "react";
import { ParticipantBottomNav, Navbar } from "@/components/shared/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Linkedin, UserPlus, CheckCircle, Sparkles } from "lucide-react";

interface MatchCard {
    id: string;
    name: string;
    bio: string;
    linkedinUrl: string;
    connected: boolean;
}

export default function MyNetworkPage() {
    const [matches, setMatches] = useState<MatchCard[]>([]);

    const handleConnect = (id: string) => {
        setMatches(matches.map((m) =>
            m.id === id ? { ...m, connected: true } : m
        ));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-20 lg:pb-0">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-8">
                <FadeIn>
                    <h1 className="text-2xl font-bold flex items-center gap-3 mb-2">
                        <Brain className="h-6 w-6 text-emerald-400" />
                        My Network
                    </h1>
                    <p className="text-zinc-400 mb-8">
                        AI-suggested connections based on complementary skills
                    </p>
                </FadeIn>

                {matches.length === 0 ? (
                    <FadeIn delay={0.1}>
                        <Card className="bg-[#111111] border-white/5">
                            <CardContent className="flex flex-col items-center py-16">
                                <Sparkles className="h-12 w-12 text-zinc-600 mb-4" />
                                <p className="text-zinc-400">No matches yet</p>
                                <p className="text-zinc-500 text-sm mt-1 text-center">
                                    The host will run AI matching when participants are checked in.
                                    You&apos;ll see your suggested connections here!
                                </p>
                            </CardContent>
                        </Card>
                    </FadeIn>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {matches.map((match, i) => (
                                <motion.div
                                    key={match.id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 50 }}
                                    transition={{ delay: i * 0.1, type: "spring", bounce: 0.3 }}
                                >
                                    <Card className={`bg-[#111111] border-white/5 ${match.connected ? "border-emerald-500/30" : "hover:border-purple-500/30"} transition-all`}>
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xl font-bold shrink-0">
                                                    {match.name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold">{match.name}</h3>
                                                        {match.connected && (
                                                            <Badge variant="success" className="text-xs">Connected</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-zinc-400 mb-3">{match.bio}</p>
                                                    <div className="flex items-center gap-3">
                                                        {match.linkedinUrl && (
                                                            <a
                                                                href={match.linkedinUrl}
                                                                target="_blank"
                                                                className="text-xs text-cyan-400 flex items-center gap-1 hover:underline"
                                                            >
                                                                <Linkedin className="h-3 w-3" />
                                                                LinkedIn
                                                            </a>
                                                        )}
                                                        {!match.connected && (
                                                            <Button
                                                                size="sm"
                                                                variant="gradient"
                                                                onClick={() => handleConnect(match.id)}
                                                            >
                                                                <UserPlus className="h-3 w-3 mr-1" />
                                                                Connect (+5 pts)
                                                            </Button>
                                                        )}
                                                        {match.connected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="flex items-center gap-1 text-emerald-400 text-xs"
                                                            >
                                                                <CheckCircle className="h-3 w-3" />
                                                                +5 points earned!
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
            <ParticipantBottomNav />
        </div>
    );
}
