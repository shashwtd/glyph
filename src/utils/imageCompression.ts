import {
    compressAccurately,
    compress,
    EImageType,
    type compressAccuratelyConfig,
    type ICompressConfig,
} from "lib-image-conversion";

export type CompressionMode = "auto" | "target-size" | "quality";

export interface CompressionOptions {
    mode: CompressionMode;
    targetSizeKB?: number;
    quality?: number;
    maintainDimensions?: boolean;
    width?: number;
    height?: number;
}

export interface CompressionResult {
    blob: Blob;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    savedBytes: number;
    savedPercentage: number;
}

const MIME_TO_EIMAGE_TYPE: Partial<Record<string, EImageType>> = {
    "image/png": EImageType.PNG,
    "image/jpeg": EImageType.JPEG,
    "image/jpg": EImageType.JPEG,
    "image/gif": EImageType.GIF,
};

export async function compressImage(
    file: File,
    options: CompressionOptions
): Promise<CompressionResult> {
    const originalSize = file.size;
    const fileType = file.type;
    const eImageType = MIME_TO_EIMAGE_TYPE[fileType];

    if (!eImageType) {
        throw new Error(`Unsupported image type: ${fileType}`);
    }

    let compressedBlob: Blob;

    try {
        if (options.mode === "target-size" && options.targetSizeKB) {
            const config: compressAccuratelyConfig = {
                size: options.targetSizeKB,
                accuracy: 0.95,
                type: eImageType,
            };

            if (!options.maintainDimensions) {
                if (options.width) config.width = options.width;
                if (options.height) config.height = options.height;
            }

            compressedBlob = await compressAccurately(file, config);
        } else if (options.mode === "quality" && options.quality !== undefined) {
            const config: ICompressConfig = {
                quality: Math.min(Math.max(options.quality, 0.1), 1),
                type: eImageType,
            };

            if (!options.maintainDimensions) {
                if (options.width) config.width = options.width;
                if (options.height) config.height = options.height;
            }

            compressedBlob = await compress(file, config);
        } else {
            // Auto mode: intelligent compression
            const config: ICompressConfig = {
                quality: 0.85,
                type: eImageType,
            };

            compressedBlob = await compress(file, config);

            // If still larger, try target size approach
            if (compressedBlob.size >= originalSize * 0.9) {
                const targetSizeKB = Math.max(Math.round((originalSize * 0.7) / 1024), 10);
                const accurateConfig: compressAccuratelyConfig = {
                    size: targetSizeKB,
                    accuracy: 0.92,
                    type: eImageType,
                };
                compressedBlob = await compressAccurately(file, accurateConfig);
            }
        }

        const compressedSize = compressedBlob.size;
        const savedBytes = Math.max(0, originalSize - compressedSize);
        const savedPercentage = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;
        const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1;

        return {
            blob: compressedBlob,
            originalSize,
            compressedSize,
            compressionRatio,
            savedBytes,
            savedPercentage,
        };
    } catch (error) {
        console.error("Compression failed:", error);
        throw new Error("Failed to compress image");
    }
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const image = new Image();

        image.onload = () => {
            resolve({ width: image.width, height: image.height });
        };
        image.onerror = () => reject(new Error("Failed to load image"));

        reader.onload = (event) => {
            image.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));

        reader.readAsDataURL(file);
    });
}
