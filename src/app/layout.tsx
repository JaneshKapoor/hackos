import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";

export const metadata: Metadata = {
    title: "Hackos — Hackathon Management Platform",
    description: "The ultimate hackathon management platform. Organize, manage, and run hackathons with ease.",
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    themeColor: "#7c3aed",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-background font-sans antialiased">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
