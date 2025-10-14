"use client";

import { usePathname } from "next/navigation";
import { FORMAT_LABELS, ImageFormat, SUPPORTED_FORMATS } from "@/utils/imageConverter";

export default function PageTitle() {
    const pathname = usePathname();
    
    if (pathname === "/app") {
        return null;
    }
    
    // Check if it's an image conversion route
    const match = pathname.match(/^\/([^/]+)-to-([^/]+)$/);
    if (match) {
        const [, from, to] = match;
        if (
            SUPPORTED_FORMATS.includes(from as ImageFormat) &&
            SUPPORTED_FORMATS.includes(to as ImageFormat)
        ) {
            return (
                <>
                    <span className="text-white/30 hidden sm:inline">/</span>
                    <span className="text-white/60 text-xs sm:text-sm hidden sm:inline ml-4">
                        Image conversion tool ({FORMAT_LABELS[from as ImageFormat]} to {FORMAT_LABELS[to as ImageFormat]})
                    </span>
                </>
            );
        }
    }
    
    return null;
}
