"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion } from "framer-motion";
import { Megaphone, Send, Loader2 } from "lucide-react";

export default function AnnouncementsPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [target, setTarget] = useState("ALL");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [announcements, setAnnouncements] = useState<any[]>([]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const eventId = new URLSearchParams(window.location.search).get("eventId");
            const res = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId, title, bodyText: body, targetGroup: target }),
            });
            if (res.ok) {
                setSent(true);
                setTitle("");
                setBody("");
                setTimeout(() => setSent(false), 3000);
            }
        } catch { }
        setSending(false);
    };

    return (
        <>
            <FadeIn>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2">
                    <Megaphone className="h-7 w-7 text-purple-400" />
                    Announcements
                </h1>
                <p className="text-zinc-400 mb-8">Send announcements to participants via email and dashboard</p>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compose */}
                <FadeIn delay={0.1}>
                    <Card className="bg-[#111111] border-white/10">
                        <CardHeader>
                            <CardTitle>New Announcement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSend} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Title *</Label>
                                    <Input
                                        placeholder="Important update..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="bg-[#0a0a0a] border-white/10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Message *</Label>
                                    <Textarea
                                        placeholder="Write your announcement here..."
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        required
                                        className="bg-[#0a0a0a] border-white/10 min-h-[150px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Target Group</Label>
                                    <Select value={target} onValueChange={setTarget}>
                                        <SelectTrigger className="bg-[#0a0a0a] border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Participants</SelectItem>
                                            <SelectItem value="APPROVED">Approved Only</SelectItem>
                                            <SelectItem value="TOP_TEAMS">Top Teams</SelectItem>
                                            <SelectItem value="TEAM_LEADS">Team Leads Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button type="submit" variant="gradient" className="w-full" disabled={sending || !title || !body}>
                                    {sending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Send className="h-4 w-4 mr-2" />
                                    )}
                                    {sent ? "Sent! ✅" : "Send Announcement"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* History */}
                <FadeIn delay={0.2}>
                    <Card className="bg-[#111111] border-white/5">
                        <CardHeader>
                            <CardTitle>Recent Announcements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {announcements.length === 0 ? (
                                <div className="text-center py-12">
                                    <Megaphone className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                                    <p className="text-zinc-400 text-sm">No announcements yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {announcements.map((a, i) => (
                                        <motion.div
                                            key={a.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="p-4 rounded-lg border border-white/5 bg-[#0a0a0a]"
                                        >
                                            <h4 className="font-medium mb-1">{a.title}</h4>
                                            <p className="text-sm text-zinc-400">{a.body}</p>
                                            <p className="text-xs text-zinc-600 mt-2">
                                                {new Date(a.createdAt).toLocaleString()}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>
        </>
    );
}
