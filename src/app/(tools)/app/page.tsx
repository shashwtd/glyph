"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Minimize2, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

const TOOLS = [
    {
        title: "JPG to PNG",
        description: "Convert JPG images to transparent PNG format",
        icon: RefreshCw,
        href: "/jpg-to-png",
        iconColor: "text-blue-400",
    },
    {
        title: "PNG to JPG",
        description: "Convert PNG images to standard JPG format",
        icon: RefreshCw,
        href: "/png-to-jpg",
        iconColor: "text-blue-400",
    },
    {
        title: "JPG to WebP",
        description: "Convert JPG images to modern WebP format",
        icon: RefreshCw,
        href: "/jpg-to-webp",
        iconColor: "text-green-400",
    },
    {
        title: "PNG to WebP",
        description: "Convert PNG images to modern WebP format",
        icon: RefreshCw,
        href: "/png-to-webp",
        iconColor: "text-green-400",
    },
    {
        title: "WebP to JPG",
        description: "Convert WebP images to standard JPG format",
        icon: RefreshCw,
        href: "/webp-to-jpg",
        iconColor: "text-orange-400",
    },
    {
        title: "WebP to PNG",
        description: "Convert WebP images to transparent PNG format",
        icon: RefreshCw,
        href: "/webp-to-png",
        iconColor: "text-orange-400",
    },
    {
        title: "Image Compressor",
        description: "Reduce image size efficiently without losing quality",
        icon: Minimize2,
        href: "/compress",
        iconColor: "text-pink-400",
        fullWidth: true,
    },
];

export default function AppPage() {
    return (
        <div className="relative z-10 w-full min-h-screen flex flex-col items-center py-20 px-4">
            <motion.div
                className="w-full max-w-6xl flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="flex flex-col items-center gap-4 mb-20">
                    <h1 className="text-4xl sm:text-6xl text-neutral-200 font-serif text-center">
                        Glyph
                    </h1>
                    <p className="text-white/40 text-center text-lg">
                        A directory of tools
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                    {TOOLS.map((tool, index) => (
                        <Link 
                            key={tool.href} 
                            href={tool.href} 
                            className={`w-full ${tool.fullWidth ? 'lg:col-span-3' : ''}`}
                        >
                            <motion.div
                                className="group h-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors duration-0 p-6 flex flex-col gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`p-2.5 bg-white/5 ${tool.iconColor}`}>
                                        <tool.icon size={20} strokeWidth={2} />
                                    </div>
                                    <ArrowRight size={18} className="text-white/20 group-hover:text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-0" />
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-medium text-neutral-200 mb-1.5">
                                        {tool.title}
                                    </h3>
                                    <p className="text-sm text-white/50 leading-relaxed">
                                        {tool.description}
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
