"use client";

import { motion } from "framer-motion";
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplet } from "lucide-react";

export default function WeatherWidget() {
    const weatherData = {
        temp: 22,
        condition: "Partly Cloudy",
        location: "Tokyo",
        humidity: 65,
        windSpeed: 12,
    };

    const getWeatherIcon = () => {
        const condition = weatherData.condition.toLowerCase();
        if (condition.includes("rain")) return <CloudRain size={32} />;
        if (condition.includes("snow")) return <CloudSnow size={32} />;
        if (condition.includes("cloud")) return <Cloud size={32} />;
        if (condition.includes("wind")) return <Wind size={32} />;
        return <Sun size={32} />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: 0.6,
            }}
            className="absolute top-24 left-6 z-20 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-4 min-w-[200px]"
        >
            <div className="flex items-center gap-4">
                <div className="text-white/80">{getWeatherIcon()}</div>
                <div className="flex-1">
                    <div className="text-3xl font-bold text-white">
                        {weatherData.temp}°C
                    </div>
                    <div className="text-sm text-white/60">
                        {weatherData.condition}
                    </div>
                    
                    <div className="text-xs text-white/50 mt-1">
                        {weatherData.location}
                    </div>
                </div>
            </div>
            <div className="flex gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-white/60">
                <div className="flex gap-1 items-center">
                    <Droplet size={14} />
                    {weatherData.humidity}%
                </div>
                <div className="flex gap-1.5 items-center">
                    <Wind size={14} />
                    {weatherData.windSpeed} km/h
                </div>
            </div>
        </motion.div>
    );
}
