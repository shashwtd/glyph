"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plug } from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const SIDEBAR_WIDTH = 260;

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
                                {/* Future: Tool categories and navigation will go here */}
                            </div>
                        </div>

                        <IntegrationsButton />
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}

function IntegrationsButton() {
    return (
        <div className="border-t border-white/10 p-4">
            <motion.button
                className="w-full px-4 py-3 rounded-lg flex items-center gap-3 text-sm text-white/70 bg-white/5 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Plug size={18} strokeWidth={2} />
                <span>Integrations</span>
            </motion.button>
        </div>
    );
}

export { SIDEBAR_WIDTH };
