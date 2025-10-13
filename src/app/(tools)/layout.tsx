"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/TopBar";
import Sidebar, { SIDEBAR_WIDTH } from "@/components/Sidebar";

const SIDEBAR_STORAGE_KEY = "glyph-sidebar-open";

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (stored !== null) {
            setIsSidebarOpen(stored === "true");
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarOpen));
        }
    }, [isSidebarOpen, mounted]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="relative min-h-screen">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <TopBar
                onMenuClick={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
            />

            <motion.main
                className="relative flex flex-col items-center justify-center overflow-hidden min-h-screen"
                animate={{
                    marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 40,
                }}
            >
                <div className="absolute inset-0 bg-[#0a0a0a]" />
                <div className="absolute inset-0 noise-texture" />

                {children}
            </motion.main>
        </div>
    );
}
