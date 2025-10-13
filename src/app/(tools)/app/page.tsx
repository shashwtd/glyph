"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

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
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={24} className="text-purple-400" strokeWidth={2} />
                    <h1 className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-tight">
                        What do you need?
                    </h1>
                </div>

                <p className="text-white/60 text-center text-sm sm:text-base font-mono mb-4">
                    Search or describe the tool you're looking for
                </p>

                <div className="w-full relative">
                    <motion.div
                        className="relative w-full"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                            size={20}
                            strokeWidth={2}
                        />
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Try 'image resizer' or 'color palette generator'..."
                            className="w-full px-12 py-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all duration-200 font-mono text-sm"
                        />
                    </motion.div>
                </div>

                <div className="flex flex-wrap gap-2 mt-6 justify-center">
                    {["Text Tools", "Image Tools", "Developer Tools", "Converters"].map(
                        (category) => (
                            <motion.button
                                key={category}
                                className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 text-white/70 font-mono text-xs hover:bg-white/10 hover:text-white/90 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {category}
                            </motion.button>
                        )
                    )}
                </div>
            </motion.div>

            <motion.div
                className="absolute bottom-8 text-white/30 font-mono text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                Press <kbd className="px-2 py-1 bg-white/10 rounded">Ctrl</kbd> +{" "}
                <kbd className="px-2 py-1 bg-white/10 rounded">K</kbd> to search anywhere
            </motion.div>
        </div>
    );
}
