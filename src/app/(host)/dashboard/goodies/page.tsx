"use client";

import { useState } from "react";
import { HostSidebar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import { Gift, Download, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GoodiesPage() {
    const [search, setSearch] = useState("");

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <HostSidebar />
            <main className="flex-1 p-4 sm:p-8 overflow-auto">
                <FadeIn>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                                <Gift className="h-7 w-7 text-purple-400" />
                                Goodies Tracker
                            </h1>
                            <p className="text-zinc-400 mt-1">Track goodie distribution to participants</p>
                        </div>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </FadeIn>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search participants..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-[#111111] border-white/10"
                        />
                    </div>
                </div>

                <Card className="bg-[#111111] border-white/5">
                    <CardContent className="flex flex-col items-center py-16">
                        <Gift className="h-12 w-12 text-zinc-600 mb-4" />
                        <p className="text-zinc-400">No goodies distributed yet</p>
                        <p className="text-zinc-500 text-sm mt-1">
                            Use the QR scanner to distribute goodies to checked-in participants
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
