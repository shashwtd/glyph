"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plug, Image } from "lucide-react";
import Link from "next/link";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const SIDEBAR_WIDTH = 260;

const IMAGE_CONVERSIONS = [
    { from: "jpg", to: "png", label: "JPG to PNG" },
    { from: "png", to: "jpg", label: "PNG to JPG" },
    { from: "jpg", to: "webp", label: "JPG to WebP" },
    { from: "png", to: "webp", label: "PNG to WebP" },
    { from: "webp", to: "jpg", label: "WebP to JPG" },
    { from: "webp", to: "png", label: "WebP to PNG" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    initial={{ x: -SIDEBAR_WIDTH }}
                    animate={{ x: 0 }}
                    exit={{ x: -SIDEBAR_WIDTH }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 40,
                    }}
                    className="fixed left-0 top-0 h-screen z-20 border-r border-white/20 overflow-hidden select-none"
                    style={{ width: SIDEBAR_WIDTH }}
                >
                    <div className="absolute inset-0 bg-[#0f0f0f]" />
                    <div className="absolute inset-0 noise-texture opacity-40" />

                    <div className="relative flex flex-col h-full font-mono text-white/80 pt-14">
                        <div className="flex-1 overflow-y-auto px-4 py-6">
                            <div className="space-y-6">
                                <ToolSection
                                    title="Image Tools"
                                    icon={Image}
                                    items={IMAGE_CONVERSIONS.map((conv) => ({
                                        label: conv.label,
                                        href: `/${conv.from}-to-${conv.to}`,
                                    }))}
                                />
                            </div>
                        </div>

                        <IntegrationsButton />
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}

function ToolSection({
    title,
    icon: Icon,
    items,
}: {
    title: string;
    icon: React.ElementType;
    items: { label: string; href: string }[];
}) {
    return (
        <div>
            <div className="flex items-center gap-2 px-2 mb-3">
                <Icon size={14} className="text-white/40" strokeWidth={2} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    {title}
                </h3>
            </div>
            <div className="space-y-1">
                {items.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <motion.div
                            className="px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors cursor-pointer"
                            whileHover={{ x: 2 }}
                        >
                            {item.label}
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function IntegrationsButton() {
    return (
        <div className="border-t border-white/10 p-4">
            <motion.button
                className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white/70 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                whileTap={{ scale: 0.98 }}
            >
                <Plug size={18} strokeWidth={2} />
                <span>Integrations</span>
            </motion.button>
        </div>
    );
}

export { SIDEBAR_WIDTH };
