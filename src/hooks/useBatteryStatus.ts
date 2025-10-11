import { useState, useEffect, useRef } from "react";

export interface BatteryStatus {
    level: number;
    charging: boolean;
}

interface BatteryManager extends EventTarget {
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    onchargingchange: (this: BatteryManager, ev: Event) => any;
    onlevelchange?: (this: BatteryManager, ev: Event) => any;
    addEventListener: (
        type: "chargingchange" | "levelchange",
        listener: (this: BatteryManager, ev: Event) => any
    ) => void;
    removeEventListener: (
        type: "chargingchange" | "levelchange",
        listener: (this: BatteryManager, ev: Event) => any
    ) => void;
}

const useBatteryStatus = (): BatteryStatus | null => {
    const [batteryStatus, setBatteryStatus] = useState<BatteryStatus | null>(
        null
    );

    useEffect(() => {
        let battery: BatteryManager | null = null;
        const updateBatteryStatus = () => {
            if (battery) {
                setBatteryStatus({
                    level: Math.round(battery.level * 100),
                    charging: battery.charging,
                });
            }
        };
        if ("getBattery" in navigator) {
            (navigator as any).getBattery().then((bat: BatteryManager) => {
                battery = bat;
                updateBatteryStatus();
                battery.addEventListener("levelchange", updateBatteryStatus);
                battery.addEventListener("chargingchange", updateBatteryStatus);
            });
        }
        return () => {
            if (battery) {
                battery.removeEventListener("levelchange", updateBatteryStatus);
                battery.removeEventListener(
                    "chargingchange",
                    updateBatteryStatus
                );
            }
        };
    }, []);
    return batteryStatus;
};
export default useBatteryStatus;
