"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { HostSidebar } from "@/components/shared/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animations/FadeIn";
import {
    Settings, Loader2, Save, ArrowLeft, Calendar,
    MapPin, Users, Eye, EyeOff, CheckCircle, Clock,
    FileText, Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

function toLocalDatetime(dateStr: string | null | undefined) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
}

export default function ManageEventPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
        maxTeamSize: 4,
        requiresApproval: true,
        isPublished: false,
        submissionsOpen: false,
        registrationDeadline: "",
        submissionDeadline: "",
    });

    const fetchEvent = useCallback(async () => {
        try {
            const res = await fetch(`/api/events/${eventId}`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data);
                setForm({
                    title: data.title || "",
                    description: data.description || "",
                    location: data.location || "",
                    startDate: toLocalDatetime(data.startDate),
                    endDate: toLocalDatetime(data.endDate),
                    maxTeamSize: data.maxTeamSize || 4,
                    requiresApproval: data.requiresApproval ?? true,
                    isPublished: data.isPublished ?? false,
                    submissionsOpen: data.submissionsOpen ?? false,
                    registrationDeadline: toLocalDatetime(data.registrationDeadline),
                    submissionDeadline: toLocalDatetime(data.submissionDeadline),
                });
            }
        } catch { }
        setLoading(false);
    }, [eventId]);

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    const saveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    location: form.location,
                    startDate: form.startDate,
                    endDate: form.endDate,
                    maxTeamSize: form.maxTeamSize,
                    requiresApproval: form.requiresApproval,
                    isPublished: form.isPublished,
                    submissionsOpen: form.submissionsOpen,
                    registrationDeadline: form.registrationDeadline || null,
                    submissionDeadline: form.submissionDeadline || null,
                }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch { }
        setSaving(false);
    };

    const updateField = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#0a0a0a]">
                <HostSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </main>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex min-h-screen bg-[#0a0a0a]">
                <HostSidebar />
                <main className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-zinc-400 mb-4">Event not found</p>
                    <Link href="/dashboard">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                        </Button>
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <HostSidebar />
            <main className="flex-1 p-4 sm:p-8 overflow-auto">
                <FadeIn>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                                    <Settings className="h-7 w-7 text-purple-400" />
                                    Manage Event
                                </h1>
                                <p className="text-zinc-400 mt-1">
                                    Edit details for <span className="text-purple-400">{event.title}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {event.slug && (
                                <Link href={`/event/${event.slug}`} target="_blank">
                                    <Button variant="outline" size="sm">
                                        <LinkIcon className="h-3.5 w-3.5 mr-1" /> View Public Page
                                    </Button>
                                </Link>
                            )}
                            <Link href={`/dashboard/participants?eventId=${eventId}`}>
                                <Button variant="outline" size="sm">
                                    <Users className="h-3.5 w-3.5 mr-1" /> Participants
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-[#111111] border-white/5">
                            <CardContent className="pt-4 pb-4 flex items-center gap-3">
                                <Users className="h-5 w-5 text-purple-400" />
                                <div>
                                    <p className="text-xl font-bold">{event._count?.registrations || 0}</p>
                                    <p className="text-xs text-zinc-500">Registrations</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#111111] border-white/5">
                            <CardContent className="pt-4 pb-4 flex items-center gap-3">
                                <FileText className="h-5 w-5 text-cyan-400" />
                                <div>
                                    <p className="text-xl font-bold">{event._count?.submissions || 0}</p>
                                    <p className="text-xs text-zinc-500">Submissions</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#111111] border-white/5">
                            <CardContent className="pt-4 pb-4 flex items-center gap-3">
                                {event.isPublished ? (
                                    <Eye className="h-5 w-5 text-emerald-400" />
                                ) : (
                                    <EyeOff className="h-5 w-5 text-zinc-500" />
                                )}
                                <div>
                                    <p className="text-sm font-medium">{event.isPublished ? "Published" : "Draft"}</p>
                                    <p className="text-xs text-zinc-500">Visibility</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#111111] border-white/5">
                            <CardContent className="pt-4 pb-4 flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-yellow-400" />
                                <div>
                                    <p className="text-sm font-medium">{new Date(event.startDate).toLocaleDateString()}</p>
                                    <p className="text-xs text-zinc-500">Start Date</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={saveEvent}>
                        <Card className="bg-[#111111] border-white/5 mb-6">
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-purple-400" />
                                    Event Details
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label>Event Title *</Label>
                                        <Input
                                            value={form.title}
                                            onChange={(e) => updateField("title", e.target.value)}
                                            required
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label>Description</Label>
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => updateField("description", e.target.value)}
                                            rows={4}
                                            className="flex w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-colors resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Location
                                        </Label>
                                        <Input
                                            value={form.location}
                                            onChange={(e) => updateField("location", e.target.value)}
                                            placeholder="San Francisco, CA"
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5 text-zinc-400" /> Max Team Size
                                        </Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={form.maxTeamSize}
                                            onChange={(e) => updateField("maxTeamSize", parseInt(e.target.value))}
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Start Date *</Label>
                                        <Input
                                            type="datetime-local"
                                            value={form.startDate}
                                            onChange={(e) => updateField("startDate", e.target.value)}
                                            required
                                            className="bg-[#0a0a0a] border-white/10 date-input-light"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date *</Label>
                                        <Input
                                            type="datetime-local"
                                            value={form.endDate}
                                            onChange={(e) => updateField("endDate", e.target.value)}
                                            required
                                            className="bg-[#0a0a0a] border-white/10 date-input-light"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Registration Deadline</Label>
                                        <Input
                                            type="datetime-local"
                                            value={form.registrationDeadline}
                                            onChange={(e) => updateField("registrationDeadline", e.target.value)}
                                            className="bg-[#0a0a0a] border-white/10 date-input-light"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Submission Deadline</Label>
                                        <Input
                                            type="datetime-local"
                                            value={form.submissionDeadline}
                                            onChange={(e) => updateField("submissionDeadline", e.target.value)}
                                            className="bg-[#0a0a0a] border-white/10 date-input-light"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Toggles */}
                        <Card className="bg-[#111111] border-white/5 mb-8">
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-purple-400" />
                                    Event Settings
                                </h2>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Eye className="h-5 w-5 text-emerald-400" />
                                            <div>
                                                <p className="font-medium">Published</p>
                                                <p className="text-xs text-zinc-500">Make the event visible on public pages</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={form.isPublished}
                                            onChange={(e) => updateField("isPublished", e.target.checked)}
                                            className="w-5 h-5 rounded bg-[#0a0a0a] border-white/20 text-purple-500 focus:ring-purple-500 cursor-pointer"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-cyan-400" />
                                            <div>
                                                <p className="font-medium">Requires Approval</p>
                                                <p className="text-xs text-zinc-500">Manually approve registrations before participants can join</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={form.requiresApproval}
                                            onChange={(e) => updateField("requiresApproval", e.target.checked)}
                                            className="w-5 h-5 rounded bg-[#0a0a0a] border-white/20 text-purple-500 focus:ring-purple-500 cursor-pointer"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-yellow-400" />
                                            <div>
                                                <p className="font-medium">Submissions Open</p>
                                                <p className="text-xs text-zinc-500">Allow teams to submit their projects</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={form.submissionsOpen}
                                            onChange={(e) => updateField("submissionsOpen", e.target.checked)}
                                            className="w-5 h-5 rounded bg-[#0a0a0a] border-white/20 text-purple-500 focus:ring-purple-500 cursor-pointer"
                                        />
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex items-center gap-4">
                            <Button type="submit" variant="gradient" disabled={saving} className="min-w-[160px]">
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : saved ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            {saved && (
                                <span className="text-sm text-emerald-400 animate-pulse">
                                    All changes saved successfully
                                </span>
                            )}
                        </div>
                    </form>
                </FadeIn>
            </main>
        </div>
    );
}
