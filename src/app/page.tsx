"use client";

import TopBar from "@/components/TopBar";
import SpotifyWidget from "@/components/SpotifyWidget";
import TimeWidget from "@/components/TimeWidget";
import WeatherWidget from "@/components/WeatherWidget";

export default function Home() {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"/>
            <div className="absolute inset-0 noise-texture" />

            <TopBar />
            <WeatherWidget />

            <div className="relative z-10 w-screen h-screen flex flex-col items-center justify-center gap-4">
                <TimeWidget />
            </div>

            <SpotifyWidget />
        </main>
    );
}
