import {
    compress,
    compressAccurately,
    EImageType,
    type ICompressConfig,
    type compressAccuratelyConfig,
} from "lib-image-conversion";

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

const MIME_TO_EIMAGE_TYPE: Partial<Record<string, EImageType>> = {
    "image/png": EImageType.PNG,
    "image/jpeg": EImageType.JPEG,
    "image/gif": EImageType.GIF,
};

const CANVAS_FALLBACK_QUALITIES = [0.88, 0.82, 0.78, 0.74];

export async function convertImage(
    file: File,
    toFormat: ImageFormat,
    quality: number = 0.92
): Promise<Blob> {
    const targetMime = FORMAT_MIME_TYPES[toFormat];
    const normalizedQuality = Math.min(Math.max(quality, 0.5), 1);
    const eImageType = MIME_TO_EIMAGE_TYPE[targetMime];
    const originalSize = file.size;

    if (eImageType) {
        try {
            const baseConfig: ICompressConfig = {
                quality: normalizedQuality,
                type: eImageType,
            };

            const compressedBlob = await compress(file, baseConfig);

            if (compressedBlob.size <= originalSize || targetMime === EImageType.PNG) {
                return compressedBlob;
            }

            const targetSizeKb = Math.max(Math.round(originalSize / 1024), 1);
            const accurateConfig: compressAccuratelyConfig = {
                size: targetSizeKb,
                accuracy: 0.95,
                type: eImageType,
            };

            const accurateBlob = await compressAccurately(file, accurateConfig);

            if (accurateBlob.size > 0 && accurateBlob.size <= originalSize) {
                return accurateBlob;
            }

            if (compressedBlob.size > 0) {
                return compressedBlob;
            }
        } catch (error) {
            console.warn("lib-image-conversion failed, falling back to canvas", error);
        }
    }

    return convertWithCanvasFallback(file, targetMime, normalizedQuality);
}

async function convertWithCanvasFallback(
    file: File,
    targetMime: string,
    normalizedQuality: number
): Promise<Blob> {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Failed to get canvas context");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const bitmap = await loadImageBitmap(file);

    if (bitmap) {
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        context.drawImage(bitmap, 0, 0);
        if (typeof bitmap.close === "function") {
            bitmap.close();
        }
    } else {
        const image = await loadImageElement(file);
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
    }

    const supportsQualityTuning = targetMime === "image/jpeg" || targetMime === "image/webp";
    const originalSize = file.size;

    const encodeBlob = (qualityOverride?: number) =>
        new Promise<Blob>((resolve) => {
            const safeQuality = typeof qualityOverride === "number" ? qualityOverride : normalizedQuality;
            const callback = (blob: Blob | null) => {
                if (blob) {
                    resolve(blob);
                } else {
                    resolve(file);
                }
            };

            try {
                if (supportsQualityTuning) {
                    canvas.toBlob(callback, targetMime, safeQuality);
                } else {
                    canvas.toBlob(callback, targetMime);
                }
            } catch (error) {
                console.warn("canvas.toBlob failed, returning original file", error);
                resolve(file);
            }
        });

    if (!supportsQualityTuning) {
        return encodeBlob();
    }

    const qualityCandidates = [
        normalizedQuality,
        ...CANVAS_FALLBACK_QUALITIES.filter((value) => value !== normalizedQuality),
    ];

    for (let i = 0; i < qualityCandidates.length; i += 1) {
        const candidate = qualityCandidates[i];
        const candidateBlob = await encodeBlob(candidate);

        if (candidateBlob.size <= originalSize || i === qualityCandidates.length - 1) {
            return candidateBlob;
        }
    }

    return encodeBlob();
}

async function loadImageBitmap(file: File): Promise<ImageBitmap | null> {
    if (typeof createImageBitmap === "undefined") {
        return null;
    }

    try {
        const bitmap = await createImageBitmap(file, {
            imageOrientation: "from-image",
            premultiplyAlpha: "premultiply",
        });
        return bitmap;
    } catch (error) {
        console.warn("createImageBitmap failed, falling back to Image", error);
        return null;
    }
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to load image"));

        reader.onload = (event) => {
            image.src = event.target?.result as string;
        };
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
