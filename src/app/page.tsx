"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/TopBar";
import Sidebar, { SIDEBAR_WIDTH } from "@/components/Sidebar";
import SpotifyWidget from "@/components/widgets/SpotifyWidget";
import TimeWidget from "@/components/widgets/TimeWidget";
import WeatherWidget from "@/components/widgets/WeatherWidget";

export default function Home() {
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
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" />
                <div className="absolute inset-0 noise-texture" />

                <WeatherWidget />

                <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center gap-4">
                    <TimeWidget />
                </div>

                <SpotifyWidget />
            </motion.main>
        </div>
    );
}
