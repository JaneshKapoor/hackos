"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/FadeIn";
import { Zap, Mail, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"credentials" | "magic">("credentials");
    const [magicSent, setMagicSent] = useState(false);

    const redirectByRole = async () => {
        // Fetch current user session to determine role
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        const role = session?.user?.role;
        if (role === "HOST") {
            router.push("/dashboard");
        } else if (role === "JUDGE") {
            router.push("/judge");
        } else {
            router.push("/my");
        }
    };

    const handleCredentialLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await signIn("credentials", {
                email,
                password: "unused",
                redirect: false,
            });
            if (result?.ok) {
                await redirectByRole();
            }
        } catch {
            // Error handling
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signIn("email", { email, redirect: false });
            setMagicSent(true);
        } catch {
            // Error handling
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
            </div>

            <FadeIn className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <Zap className="h-8 w-8 text-purple-500" />
                        <span className="text-2xl font-bold gradient-text">Hackos</span>
                    </Link>
                    <p className="text-zinc-400 text-sm">Sign in to manage your hackathons</p>
                </div>

                <Card className="bg-[#111111] border-white/10">
                    <CardHeader>
                        <CardTitle>Welcome back</CardTitle>
                        <CardDescription>
                            {mode === "credentials"
                                ? "Enter your email to sign in"
                                : magicSent
                                    ? "Check your inbox"
                                    : "We'll send you a magic link"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {magicSent ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6"
                            >
                                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Mail className="h-8 w-8 text-purple-400" />
                                </div>
                                <p className="text-zinc-300 mb-2">Magic link sent!</p>
                                <p className="text-zinc-500 text-sm">Check your email at <strong>{email}</strong></p>
                            </motion.div>
                        ) : (
                            <form onSubmit={mode === "credentials" ? handleCredentialLogin : handleMagicLink}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-[#0a0a0a] border-white/10"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        className="w-full"
                                        disabled={loading || !email}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                        )}
                                        {mode === "credentials" ? "Sign In" : "Send Magic Link"}
                                    </Button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-white/5" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-[#111111] px-2 text-zinc-500">or</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setMode(mode === "credentials" ? "magic" : "credentials")}
                                    >
                                        {mode === "credentials" ? (
                                            <>
                                                <Mail className="h-4 w-4 mr-2" />
                                                Use Magic Link Instead
                                            </>
                                        ) : (
                                            "Use Quick Sign In"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-zinc-500 text-xs mt-6">
                    Quick Sign In looks up your existing account and redirects based on your role.
                </p>
            </FadeIn>
        </div>
    );
}
