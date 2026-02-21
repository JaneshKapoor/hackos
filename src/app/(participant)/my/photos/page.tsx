"use client";

import { useState } from "react";
import { ParticipantBottomNav, Navbar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion } from "framer-motion";
import { Camera, Loader2, ImageIcon, Sparkles } from "lucide-react";

export default function MyPhotosPage() {
    const [loading, setLoading] = useState(false);
    const [matchedPhotos, setMatchedPhotos] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    const findMyPhotos = async () => {
        setLoading(true);
        setProgress(0);

        // Simulate face matching progress
        const interval = setInterval(() => {
            setProgress((p) => {
                if (p >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return p + 5;
            });
        }, 200);

        // In production: load face-api models, get selfie descriptor,
        // compare against all event photos, show matches
        setTimeout(() => {
            clearInterval(interval);
            setProgress(100);
            setLoading(false);
            // Demo: no photos matched
        }, 4000);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-20 lg:pb-0">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-8">
                <FadeIn>
                    <h1 className="text-2xl font-bold flex items-center gap-3 mb-2">
                        <Camera className="h-6 w-6 text-cyan-400" />
                        My Photos
                    </h1>
                    <p className="text-zinc-400 mb-8">
                        Find your photos from the event using face recognition
                    </p>
                </FadeIn>

                <FadeIn delay={0.1}>
                    <Card className="bg-[#111111] border-white/10 mb-6">
                        <CardContent className="pt-6 text-center">
                            <p className="text-sm text-zinc-400 mb-4">
                                We&apos;ll use your selfie to find all photos where you appear using
                                AI face recognition — all processed locally in your browser.
                            </p>

                            {loading ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-3">
                                        <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                                        <span className="text-sm text-zinc-300">Analyzing photos... {progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <Button variant="gradient" onClick={findMyPhotos}>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Show My Pictures
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>

                {matchedPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {matchedPhotos.map((url, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <img
                                    src={url}
                                    alt={`Event photo ${i + 1}`}
                                    className="rounded-lg w-full aspect-square object-cover"
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : !loading ? (
                    <Card className="bg-[#111111] border-white/5">
                        <CardContent className="flex flex-col items-center py-12">
                            <ImageIcon className="h-12 w-12 text-zinc-600 mb-4" />
                            <p className="text-zinc-400">No matching photos found</p>
                            <p className="text-zinc-500 text-sm mt-1">
                                Photos will appear here as the host uploads event pictures
                            </p>
                        </CardContent>
                    </Card>
                ) : null}
            </main>
            <ParticipantBottomNav />
        </div>
    );
}
