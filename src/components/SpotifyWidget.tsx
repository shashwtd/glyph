"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";

export default function SpotifyWidget() {
    const [isPlaying, setIsPlaying] = useState(true);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: 0.5
            }}
            className="absolute bottom-6 left-6 z-20 w-80 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg overflow-hidden"
        >
            <AlbumInfo isPlaying={isPlaying} />
            <PlaybackControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        </motion.div>
    );
}

function AlbumInfo({ isPlaying }: { isPlaying: boolean }) {
    return (
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0 relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
            >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ 
                        duration: 3,
                        repeat: isPlaying ? Infinity : 0,
                        ease: "linear"
                    }}
                />
            </motion.div>
            <div className="flex-1 min-w-0">
                <motion.div 
                    className="text-sm font-semibold text-white truncate"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    Moonlight Sonata
                </motion.div>
                <motion.div 
                    className="text-xs text-white/60 truncate"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.75 }}
                >
                    Ludwig van Beethoven
                </motion.div>
            </div>
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Volume2 size={18} className="text-white/60 cursor-pointer" />
            </motion.div>
        </div>
    );
}

interface PlaybackControlsProps {
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
}

function PlaybackControls({ isPlaying, setIsPlaying }: PlaybackControlsProps) {
    return (
        <div className="px-4 py-3">
            <ProgressBar />
            <div className="flex items-center justify-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white/60 hover:text-white/90 transition-colors cursor-pointer"
                >
                    <SkipBack size={20} fill="currentColor" />
                </motion.button>
                
                <motion.button
                    onClick={() => setIsPlaying(!isPlaying)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-purple-600 hover:bg-white transition-colors cursor-pointer"
                >
                    {isPlaying ? (
                        <Pause size={20} fill="currentColor" />
                    ) : (
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                </motion.button>
                
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white/60 hover:text-white/90 transition-colors cursor-pointer"
                >
                    <SkipForward size={20} fill="currentColor" />
                </motion.button>
            </div>
        </div>
    );
}

function ProgressBar() {
    return (
        <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
            <span>1:23</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "45%" }}
                    transition={{ duration: 1, delay: 0.8 }}
                />
            </div>
            <span>3:05</span>
        </div>
    );
}
