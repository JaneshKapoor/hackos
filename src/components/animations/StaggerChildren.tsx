"use client";

import { motion, type MotionProps } from "framer-motion";
import { type ReactNode } from "react";

interface StaggerChildrenProps extends MotionProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
    initialDelay?: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: (custom: { staggerDelay: number; initialDelay: number }) => ({
        opacity: 1,
        transition: {
            staggerChildren: custom.staggerDelay,
            delayChildren: custom.initialDelay,
        },
    }),
};

export const staggerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
};

export function StaggerChildren({
    children,
    className,
    staggerDelay = 0.1,
    initialDelay = 0,
    ...props
}: StaggerChildrenProps) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={{ staggerDelay, initialDelay }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div variants={staggerItemVariants} className={className}>
            {children}
        </motion.div>
    );
}
