"use client";

import TopBar from "@/components/TopBar";
import SpotifyWidget from "@/components/SpotifyWidget";

export default function Home() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/bg-blue.jpg)' }} />
            <div className="absolute inset-0 noise-texture" />

            <TopBar />

            <div className="relative z-10 w-screen h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white/70 drop-shadow-sm">
                    こんにちは
                </h1>
            </div>

            <SpotifyWidget />
        </main>
    );
}
