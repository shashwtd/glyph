"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function TimeWidget() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: 0.2
            }}
            className="relative z-10 flex flex-col items-center justify-center gap-2 opacity-80! select-none"
        >
            <motion.div 
                className="text-8xl sm:text-8xl font-semibold tracking-tight text-white/40 drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] font-sans [text-shadow:_2px_2px_0_#fff2,2px_-2px_0_#fff2,-2px_2px_0_#000,-2px_-2px_0_#fff5]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                {formatTime(time)}
            </motion.div>

            <motion.div 
                className="text-lg sm:text-lg font-medium font-mono tracking-tight text-white/60 drop-shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                {formatDate(time)}
            </motion.div>
        </motion.div>
    );
}
