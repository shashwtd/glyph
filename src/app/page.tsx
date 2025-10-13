"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";

export default function Home() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[#0a0a0a]" />
            <div className="absolute inset-0 noise-texture" />

            <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-6">
                <motion.h1
                    className="font-serif text-white/70 text-[clamp(3rem,12vw,8rem)] leading-[0.85] tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    Glyph
                </motion.h1>

                <motion.p
                    className="text-white/60 sm:text-lg max text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                >
                    powerful tools designed to enhance your workflow
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                >
                    <div className="flex items-center gap-4">
                        <Link href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">
                            <motion.button
                                initial="rest"
                                whileHover="hover"
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="px-8 py-4 bg-white/10 hover:bg-white/15 backdrop-blur-xl text-neutral-400 font-mono text-sm flex items-center gap-3 cursor-pointer outline outline-transparent hover:outline-white/20 outline-offset-3 transition-colors"
                            >
                                <Github size={18} strokeWidth={2} className="text-neutral-400" />
                                <span>View GitHub</span>
                            </motion.button>
                        </Link>
                        <Link href="/app">
                            <motion.button
                                initial="rest"
                                whileHover="hover"
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="px-8 py-4 bg-white/10 hover:bg-white/15 backdrop-blur-xl text-neutral-400 font-mono text-sm flex items-center gap-3 cursor-pointer outline outline-transparent hover:outline-white/20 outline-offset-3 transition-colors"
                            >
                                View App
                                <motion.span
                                    // arrow will move right on hover
                                    variants={{ rest: { x: 0 }, hover: { x: 6 } }}
                                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                                >
                                    <ArrowRight size={18} strokeWidth={2} />
                                </motion.span>
                            </motion.button>
                        </Link>

                    </div>
                </motion.div>
            </div>
        </main>
    );
}
