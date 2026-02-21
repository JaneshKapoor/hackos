"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { FadeIn } from "@/components/animations/FadeIn";
import { SlideUp } from "@/components/animations/SlideUp";
import {
    Calendar,
    MapPin,
    Users,
    Camera,
    Loader2,
    CheckCircle,
    Plus,
    Trash2,
    Upload,
    Linkedin,
    FileText,
} from "lucide-react";

interface TeamMember {
    name: string;
    email: string;
    linkedinUrl: string;
    bio: string;
}

export default function EventRegistrationPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isTeam, setIsTeam] = useState(false);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraActive, setCameraActive] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        linkedinUrl: "",
        bio: "",
        teamName: "",
    });

    const [members, setMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        // Fetch event by slug
        fetch(`/api/events?slug=${slug}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setEvent(data.find((e: any) => e.slug === slug) || null);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [slug]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 480 },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch {
            alert("Could not access camera. Please upload a selfie instead.");
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setSelfiePreview(dataUrl);
        stopCamera();
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setSelfiePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const addMember = () => {
        if (members.length < 3) {
            setMembers([...members, { name: "", email: "", linkedinUrl: "", bio: "" }]);
        }
    };

    const removeMember = (idx: number) => {
        setMembers(members.filter((_, i) => i !== idx));
    };

    const updateMember = (idx: number, field: keyof TeamMember, value: string) => {
        const updated = [...members];
        updated[idx][field] = value;
        setMembers(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event) return;
        setSubmitting(true);

        try {
            const res = await fetch("/api/registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: event.id,
                    teamName: formData.teamName,
                    isTeam,
                    leader: {
                        name: formData.name,
                        email: formData.email,
                        linkedinUrl: formData.linkedinUrl,
                        bio: formData.bio,
                        selfie: selfiePreview,
                    },
                    members: isTeam ? members : [],
                }),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const err = await res.json();
                alert(err.error || "Registration failed");
            }
        } catch {
            alert("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    // Success screen
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                    className="text-center max-w-md"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                        className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle className="h-12 w-12 text-emerald-400" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl font-bold mb-3"
                    >
                        You&apos;re on the list! 🎉
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-zinc-400 mb-6"
                    >
                        Your registration for <span className="text-cyan-400 font-medium">{event?.title}</span> has been received.
                        Check your email for confirmation.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-sm"
                    >
                        ⏳ Status: Pending Approval
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    // Fallback event data for demo
    const displayEvent = event || {
        title: "Demo Hackathon 2026",
        description: "Join us for an incredible 48-hour hackathon where innovation meets creativity. Build something amazing!",
        location: "San Francisco, CA",
        startDate: new Date("2026-03-15"),
        endDate: new Date("2026-03-17"),
        maxTeamSize: 4,
        bannerImage: null,
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hero */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />

                <div className="relative max-w-3xl mx-auto px-4 pt-20 pb-12 text-center">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-xs font-medium mb-6">
                            ⚡ Registration Open
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.1}>
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 gradient-text">
                            {displayEvent.title}
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-lg">
                            {displayEvent.description}
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-purple-400" />
                                {new Date(displayEvent.startDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })} — {new Date(displayEvent.endDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>
                            {displayEvent.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-cyan-400" />
                                    {displayEvent.location}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-emerald-400" />
                                Max {displayEvent.maxTeamSize} per team
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>

            {/* Registration Form */}
            <div className="max-w-2xl mx-auto px-4 pb-20">
                <SlideUp delay={0.4}>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Info */}
                        <Card className="bg-[#111111] border-white/10">
                            <CardContent className="pt-6 space-y-4">
                                <h2 className="text-lg font-semibold mb-2">Personal Information</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                                        <Linkedin className="h-3.5 w-3.5" /> LinkedIn URL
                                    </Label>
                                    <Input
                                        id="linkedin"
                                        placeholder="https://linkedin.com/in/..."
                                        value={formData.linkedinUrl}
                                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                        className="bg-[#0a0a0a] border-white/10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Short Bio *</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about yourself, your skills, and what you're excited to build..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        required
                                        className="bg-[#0a0a0a] border-white/10 min-h-[100px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selfie */}
                        <Card className="bg-[#111111] border-white/10">
                            <CardContent className="pt-6 space-y-4">
                                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                    <Camera className="h-5 w-5" /> Selfie
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    Upload a selfie for check-in face matching and your profile photo
                                </p>

                                <div className="flex flex-col items-center gap-4">
                                    {selfiePreview ? (
                                        <div className="relative">
                                            <img
                                                src={selfiePreview}
                                                alt="Selfie preview"
                                                className="w-40 h-40 rounded-full object-cover border-2 border-purple-500/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setSelfiePreview(null)}
                                                className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : cameraActive ? (
                                        <div className="relative">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-64 h-48 rounded-xl object-cover"
                                            />
                                            <div className="flex gap-2 mt-3 justify-center">
                                                <Button type="button" size="sm" variant="gradient" onClick={capturePhoto}>
                                                    📸 Capture
                                                </Button>
                                                <Button type="button" size="sm" variant="outline" onClick={stopCamera}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            <Button type="button" variant="outline" onClick={startCamera}>
                                                <Camera className="h-4 w-4 mr-2" />
                                                Take Selfie
                                            </Button>
                                            <Label htmlFor="selfie-upload" className="cursor-pointer">
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
                                                    <Upload className="h-4 w-4" />
                                                    Upload Photo
                                                </div>
                                            </Label>
                                            <input
                                                id="selfie-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Team Toggle */}
                        <Card className="bg-[#111111] border-white/10">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">Register as a Team</h2>
                                        <p className="text-sm text-zinc-400">
                                            Add up to {(displayEvent.maxTeamSize || 4) - 1} team members
                                        </p>
                                    </div>
                                    <Switch
                                        checked={isTeam}
                                        onCheckedChange={setIsTeam}
                                    />
                                </div>

                                <AnimatePresence>
                                    {isTeam && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="teamName">Team Name *</Label>
                                                <Input
                                                    id="teamName"
                                                    placeholder="The Debuggers"
                                                    value={formData.teamName}
                                                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                                    required={isTeam}
                                                    className="bg-[#0a0a0a] border-white/10"
                                                />
                                            </div>

                                            {members.map((member, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="p-4 rounded-lg border border-white/5 bg-[#0a0a0a] space-y-3"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-zinc-400">
                                                            Member {idx + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMember(idx)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <Input
                                                            placeholder="Full Name"
                                                            value={member.name}
                                                            onChange={(e) => updateMember(idx, "name", e.target.value)}
                                                            className="bg-[#111111] border-white/10"
                                                        />
                                                        <Input
                                                            type="email"
                                                            placeholder="Email"
                                                            value={member.email}
                                                            onChange={(e) => updateMember(idx, "email", e.target.value)}
                                                            className="bg-[#111111] border-white/10"
                                                        />
                                                        <Input
                                                            placeholder="LinkedIn URL"
                                                            value={member.linkedinUrl}
                                                            onChange={(e) => updateMember(idx, "linkedinUrl", e.target.value)}
                                                            className="bg-[#111111] border-white/10"
                                                        />
                                                        <Input
                                                            placeholder="Short bio"
                                                            value={member.bio}
                                                            onChange={(e) => updateMember(idx, "bio", e.target.value)}
                                                            className="bg-[#111111] border-white/10"
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {members.length < (displayEvent.maxTeamSize || 4) - 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addMember}
                                                    className="w-full border-dashed"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Team Member
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="gradient"
                            size="xl"
                            className="w-full"
                            disabled={submitting || !formData.name || !formData.email || !formData.bio}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Registering...
                                </>
                            ) : (
                                <>
                                    Register Now ⚡
                                </>
                            )}
                        </Button>
                    </form>
                </SlideUp>
            </div>
        </div>
    );
}
