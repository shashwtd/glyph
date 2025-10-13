"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronsRightIcon, Search, Sparkles } from "lucide-react";

export default function AppPage() {
    const [input, setInput] = useState("");

    return (
        <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center gap-8 px-6">
            <motion.div
                className="flex flex-col items-center gap-4 max-w-2xl w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="flex flex-col items-center gap-4 mb-8">
                    <h1 className="text-3xl sm:text-5xl text-neutral-400 font-serif">
                        What are we doing today?
                    </h1>
                    {/* <p className="text-white/60 text-center text-sm sm:text-base mb-4">
                        Type to search for tools or select from the list of tools below
                    </p> */}
                </div>

                <div className="w-full relative pb-20">
                    <motion.div
                        className="relative w-full"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronsRightIcon
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                            size={20}
                            strokeWidth={2}
                        />
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Try 'compress images' or 'png to jpg'..."
                            className="w-full px-12 py-4 bg-white/5 text-neutral-200 font-mono text-sm cursor-text outline outline-white/5 outline-offset-3 transition-colors focus:outline-white/10"
                        />
                    </motion.div>
                </div>

                {/* <div className="flex flex-wrap gap-2 mt-6 justify-center">
                    {[
                        "Text Tools",
                        "Image Tools",
                        "Developer Tools",
                        "Converters",
                    ].map((category) => (
                        <motion.button
                            key={category}
                            className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white/70 font-mono text-xs hover:bg-white/10 hover:text-white/90 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {category}
                        </motion.button>
                    ))}
                </div> */}
            </motion.div>

            <motion.div
                className="absolute bottom-8 text-white/30 font-mono text-xs select-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                Press <kbd className="px-2 py-1 bg-white/10 rounded">Ctrl</kbd>{" "}
                + <kbd className="px-2 py-1 bg-white/10 rounded">K</kbd> to
                search anywhere
            </motion.div>
        </div>
    );
}
