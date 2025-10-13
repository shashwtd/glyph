export type ImageFormat = "jpg" | "png" | "webp" | "gif" | "bmp";

export const SUPPORTED_FORMATS: ImageFormat[] = ["jpg", "png", "webp", "gif", "bmp"];

export const FORMAT_MIME_TYPES: Record<ImageFormat, string> = {
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
};

export const FORMAT_LABELS: Record<ImageFormat, string> = {
    jpg: "JPG/JPEG",
    png: "PNG",
    webp: "WebP",
    gif: "GIF",
    bmp: "BMP",
};

export async function convertImage(
    file: File,
    toFormat: ImageFormat,
    quality: number = 0.92
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Failed to get canvas context"));
                return;
            }

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Conversion failed"));
                    }
                },
                FORMAT_MIME_TYPES[toFormat],
                quality
            );
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function getFileExtension(format: ImageFormat): string {
    return format === "jpg" ? "jpg" : format;
}
