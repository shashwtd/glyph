import ImageCompressor from "@/components/ImageCompressor";

export const metadata = {
    title: "Image Compression - Glyph",
    description: "Compress your images to reduce file size while maintaining quality",
};

export default function ImageCompressionPage() {
    return (
        <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center gap-8">
            <ImageCompressor />
        </div>
    );
}