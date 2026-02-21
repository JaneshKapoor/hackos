"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

interface QRScannerProps {
    onScan: (data: string) => void;
    className?: string;
}

export function QRScanner({ onScan, className }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const startScanning = useCallback(async () => {
        try {
            setError(null);
            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    onScan(decodedText);
                },
                () => { }
            );

            setIsScanning(true);
        } catch (err: any) {
            setError(err?.message || "Could not access camera");
            setIsScanning(false);
        }
    }, [onScan]);

    const stopScanning = useCallback(async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch { }
            scannerRef.current = null;
        }
        setIsScanning(false);
    }, []);

    useEffect(() => {
        return () => {
            stopScanning();
        };
    }, [stopScanning]);

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>QR Scanner</span>
                    <Button
                        variant={isScanning ? "destructive" : "gradient"}
                        size="sm"
                        onClick={isScanning ? stopScanning : startScanning}
                    >
                        {isScanning ? (
                            <>
                                <CameraOff className="h-4 w-4 mr-2" />
                                Stop
                            </>
                        ) : (
                            <>
                                <Camera className="h-4 w-4 mr-2" />
                                Start Scanning
                            </>
                        )}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    ref={containerRef}
                    id="qr-reader"
                    className="w-full max-w-md mx-auto rounded-lg overflow-hidden"
                    style={{ minHeight: isScanning ? 300 : 0 }}
                />
                {error && (
                    <p className="text-red-400 text-sm text-center mt-4">{error}</p>
                )}
                {!isScanning && !error && (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                        <Camera className="h-12 w-12 mb-4 opacity-30" />
                        <p className="text-sm">Click &quot;Start Scanning&quot; to open camera</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
