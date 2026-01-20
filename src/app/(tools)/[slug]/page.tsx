import { notFound } from "next/navigation";
import ImageConverter from "@/components/ImageConverter";
import { SUPPORTED_FORMATS, ImageFormat, FORMAT_LABELS } from "@/utils/imageConverter";
import type { Metadata } from "next";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const parts = slug.split("-to-");

    if (parts.length !== 2) {
        return {
            title: "Not Found - Glyph",
            description: "Page not found",
        };
    }

    const [fromFormat, toFormat] = parts as [string, string];

    if (
        !SUPPORTED_FORMATS.includes(fromFormat as ImageFormat) ||
        !SUPPORTED_FORMATS.includes(toFormat as ImageFormat)
    ) {
        return {
            title: "Not Found - Glyph",
            description: "Page not found",
        };
    }

    return {
        title: `${FORMAT_LABELS[fromFormat as ImageFormat]} to ${FORMAT_LABELS[toFormat as ImageFormat]} Converter - Glyph`,
        description: `Convert your ${FORMAT_LABELS[fromFormat as ImageFormat]} images to ${FORMAT_LABELS[toFormat as ImageFormat]} format`,
    };
}

export default async function ImageConversionPage({ params }: PageProps) {
    const { slug } = await params;
    const parts = slug.split("-to-");
    
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
        <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center gap-8">
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
