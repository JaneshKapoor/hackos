"use client";

import { motion, type MotionProps } from "framer-motion";
import { type ReactNode } from "react";

interface SlideUpProps extends MotionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    offset?: number;
}

export function SlideUp({
    children,
    className,
    delay = 0,
    duration = 0.5,
    offset = 30,
    ...props
}: SlideUpProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: offset }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
