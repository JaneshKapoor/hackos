"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeLib from "qrcode";
import { generateQRUrl } from "@/lib/utils";

interface QRDisplayProps {
    qrToken: string;
    size?: number;
    className?: string;
}

export function QRDisplay({ qrToken, size = 256, className }: QRDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (canvasRef.current && qrToken) {
            const url = generateQRUrl(qrToken);
            QRCodeLib.toCanvas(canvasRef.current, url, {
                width: size,
                margin: 2,
                color: {
                    dark: "#ffffff",
                    light: "#0a0a0a",
                },
                errorCorrectionLevel: "M",
            }).catch(() => setError(true));
        }
    }, [qrToken, size]);

    if (error) {
        return (
            <div className="flex items-center justify-center p-8 text-red-400 text-sm">
                Failed to generate QR code
            </div>
        );
    }

    return (
        <div className={`inline-block rounded-xl p-4 bg-[#0a0a0a] border border-white/10 qr-glow ${className || ""}`}>
            <canvas ref={canvasRef} />
            <p className="text-center text-xs text-zinc-500 mt-2">
                Scan for check-in
            </p>
        </div>
    );
}
