"use client";

import { motion, type MotionProps } from "framer-motion";
import { type ReactNode } from "react";

interface FadeInProps extends MotionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    direction?: "up" | "down" | "left" | "right";
}

export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.5,
    direction,
    ...props
}: FadeInProps) {
    const directionOffset = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
    };

    const initial = {
        opacity: 0,
        ...(direction ? directionOffset[direction] : {}),
    };

    return (
        <motion.div
            initial={initial}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
