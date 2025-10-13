"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/TopBar";
import Sidebar, { SIDEBAR_WIDTH } from "@/components/Sidebar";

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="relative min-h-screen">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <TopBar
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
