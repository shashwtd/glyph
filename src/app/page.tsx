"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Home() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[#0a0a0a]" />
            <div className="absolute inset-0 noise-texture" />

            <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-6">
                <motion.h1
                    className="font-bold text-white text-[clamp(4rem,15vw,12rem)] leading-[0.85] tracking-[-0.08em]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    Glyph
                </motion.h1>

                <motion.p
                    className="text-white/60 text-lg sm:text-xl max-w-md text-center font-mono"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                >
                    A collection of powerful tools designed to enhance your workflow
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                >
                    <Link href="/app">
                        <motion.button
                            className="px-8 py-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white font-mono text-sm flex items-center gap-3 cursor-pointer"
                            whileHover={{
                                scale: 1.02,
                                backgroundColor: "rgba(255, 255, 255, 0.15)",
                            }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            View App
                            <ArrowRight size={18} strokeWidth={2} />
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
