"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Settings,
    Link2,
    LogOut,
    Pencil,
    Zap,
    PanelRightClose,
    ChevronDown,
} from "lucide-react";
import useBatteryStatus, { BatteryStatus } from "@/hooks/useBatteryStatus";
import Link from "next/link";

const MENU_ITEMS = [
    { name: "Profile", icon: User },
    { name: "Settings", icon: Settings },
    { name: "Connections", icon: Link2 },
];

interface TopBarProps {
    onMenuClick: () => void;
    isSidebarOpen: boolean;
}

export default function TopBar({ onMenuClick, isSidebarOpen }: TopBarProps) {
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const batteryStatus: BatteryStatus | null = useBatteryStatus();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setProfileOpen(false);
            }
        };

        if (profileOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileOpen]);

    return (
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between select-none px-3 sm:px-6 py-2 sm:py-3 font-mono text-white/80 text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-4">
                <motion.button
                    className="p-1.5 w-max h-max rounded-lg cursor-pointer"
                    onClick={onMenuClick}
                    whileHover={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        scale: 1.05,
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        animate={{
                            rotate: isSidebarOpen ? 180 : 0,
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <PanelRightClose size={20} />
                    </motion.div>
                </motion.button>
                <Link href="/">
                    <div className="font-semibold">Glyph</div>
                </Link>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-4">
                <BatteryIndicator
                    percentage={batteryStatus?.level || 0}
                    isCharging={batteryStatus?.charging || false}
                />
                <ProfileMenu
                    profileOpen={profileOpen}
                    setProfileOpen={setProfileOpen}
                    profileRef={profileRef}
                />
            </div>
        </div>
    );
}

function BatteryIndicator({
    percentage,
    isCharging,
}: {
    percentage: number;
    isCharging: boolean;
}) {
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    return (
        <div className="flex items-center gap-1.5 sm:gap-2 relative">
            <div className="relative flex items-center">
                <div className="w-5 sm:w-6 h-3 sm:h-3.5 border border-white/80 rounded-sm relative overflow-hidden">
                    {isCharging && (
                        <Zap
                            size={8}
                            className="text-white opacity-70 absolute z-10 -translate-x-1/2 left-1/2 top-1/2 -translate-y-1/2 mix-blend-difference"
                            fill="currentColor"
                        />
                    )}
                    <div
                        className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 bg-neutral-600 rounded-[1px]"
                        style={{
                            width: `calc(${clampedPercentage}% - 4px)`,
                            maxWidth: "calc(100% - 4px)",
                        }}
                    />
                </div>
                <div className="w-[1.5px] h-1.5 bg-white/60 ml-px rounded-r-sm relative" />
            </div>
            <span className="text-[10px] sm:text-sm">
                {Math.round(clampedPercentage)}%
            </span>
        </div>
    );
}

interface ProfileMenuProps {
    profileOpen: boolean;
    setProfileOpen: (open: boolean) => void;
    profileRef: React.RefObject<HTMLDivElement | null>;
}

function ProfileMenu({
    profileOpen,
    setProfileOpen,
    profileRef,
}: ProfileMenuProps) {
    // Gentle animation settings for better UX
    const containerHover = { scale: 1.03 };
    const containerTap = { scale: 0.98 };

    return (
        <div className="relative hidden lg:block ml-2" ref={profileRef}>
            <motion.div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setProfileOpen(!profileOpen)}
                whileHover={containerHover}
                whileTap={containerTap}
                animate={{ scale: profileOpen ? 1.02 : 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 20 }}
            >
                <motion.div
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 border border-white/30 cursor-pointer"
                    role="button"
                    aria-hidden="true"
                    animate={{
                        boxShadow: profileOpen
                            ? "0 6px 18px rgba(168,85,247,0.12)"
                            : "0 4px 10px rgba(0,0,0,0.12)",
                    }}
                    transition={{ duration: 0.25 }}
                />

                <motion.div
                    animate={{ rotate: profileOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 22 }}
                >
                    <ChevronDown
                        size={16}
                        className="text-white/80"
                        strokeWidth={2.5}
                    />
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {profileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute right-0 top-10 min-w-[240px] max-w-[280px] bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg overflow-hidden origin-top-right"
                    >
                        <ProfileHeader />
                        <ProfileMenuItems />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ProfileHeader() {
    return (
        <motion.div
            className="p-4 border-b border-white/10"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
        >
            <div className="flex items-center gap-3">
                <div className="relative group cursor-pointer">
                    <motion.div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.button
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Pencil
                            size={14}
                            className="text-white"
                            strokeWidth={2.5}
                        />
                    </motion.button>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                        User
                    </div>
                    <div className="text-xs text-white/60 truncate">
                        shashwat55902@gmail.com
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ProfileMenuItems() {
    return (
        <div className="p-2">
            {MENU_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                    <motion.button
                        key={item.name}
                        className="w-full text-left px-3 py-2.5 text-sm text-white/80 rounded-lg flex items-center gap-2.5 cursor-pointer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            transition: {
                                delay: 0.12 + i * 0.04,
                                duration: 0.2,
                            },
                        }}
                        whileHover={{
                            backgroundColor: "rgba(255, 255, 255, 0.12)",
                            x: 3,
                            transition: { duration: 0 },
                        }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Icon size={16} strokeWidth={2} />
                        {item.name}
                    </motion.button>
                );
            })}

            <motion.div
                className="h-px bg-white/10 my-2 mx-2"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.24, duration: 0.2 }}
            />

            <motion.button
                className="w-full text-left px-3 py-2.5 text-sm text-red-300/80 rounded-lg flex items-center gap-2.5 cursor-pointer"
                initial={{ opacity: 0, x: -10 }}
                animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                        delay: 0.28,
                        duration: 0.2,
                    },
                }}
                whileHover={{
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    x: 3,
                    color: "rgba(252, 165, 165, 1)",
                    transition: { duration: 0 },
                }}
                whileTap={{ scale: 0.97 }}
            >
                <LogOut size={16} strokeWidth={2} />
                Sign Out
            </motion.button>
        </div>
    );
}
