"use client";

import { motion, AnimatePresence } from "framer-motion";

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
                    className="fixed left-0 top-0 h-screen z-20 border-r border-white/10 overflow-hidden"
                    style={{ width: SIDEBAR_WIDTH }}
                >
                    <div className="absolute inset-0 bg-[#0a0a0a]" />
                    <div className="absolute inset-0 noise-texture opacity-60" />
                    
                    <div className="relative flex flex-col h-full font-mono text-white/80 pt-14">
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Sidebar content goes here */}
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}

export { SIDEBAR_WIDTH };
