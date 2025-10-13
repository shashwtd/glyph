import { notFound } from "next/navigation";
import ImageConverter from "@/components/ImageConverter";
import { SUPPORTED_FORMATS, ImageFormat } from "@/utils/imageConverter";

interface PageProps {
    params: {
        slug: string;
    };
}

export default function ImageConversionPage({ params }: PageProps) {
    const parts = params.slug.split("-to-");
    
    if (parts.length !== 2) {
        notFound();
    }

    const [fromFormat, toFormat] = parts as [string, string];

    if (
        !SUPPORTED_FORMATS.includes(fromFormat as ImageFormat) ||
        !SUPPORTED_FORMATS.includes(toFormat as ImageFormat)
    ) {
        notFound();
    }

    return (
        <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center gap-8 px-6">
            <ImageConverter
                fromFormat={fromFormat as ImageFormat}
                toFormat={toFormat as ImageFormat}
            />
        </div>
    );
}

export async function generateStaticParams() {
    const params: { slug: string }[] = [];

    SUPPORTED_FORMATS.forEach((from) => {
        SUPPORTED_FORMATS.forEach((to) => {
            if (from !== to) {
                params.push({ slug: `${from}-to-${to}` });
            }
        });
    });

    return params;
}
