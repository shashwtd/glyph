"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, X, Check, Copy, Settings } from "lucide-react";
import {
    compressImage,
    formatBytes,
    getImageDimensions,
    type CompressionOptions,
    type CompressionResult,
} from "@/utils/imageCompression";
import { downloadBlob } from "@/utils/imageConverter";

interface FileWithData {
    file: File;
    preview: string;
    result: CompressionResult | null;
    dimensions: { width: number; height: number } | null;
    copied: boolean;
    compressing: boolean;
}

export default function ImageCompressor() {
    const [files, setFiles] = useState<FileWithData[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [customQuality, setCustomQuality] = useState(false);
    const [quality, setQuality] = useState<number>(0.85);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (selectedFiles: FileList) => {
        const newFiles: FileWithData[] = [];

        for (const file of Array.from(selectedFiles)) {
            if (!file.type.startsWith("image/")) continue;

            const reader = new FileReader();
            const preview = await new Promise<string>((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });

            let dimensions: { width: number; height: number } | null = null;
            try {
                dimensions = await getImageDimensions(file);
            } catch (error) {
                console.warn("Failed to get dimensions", error);
            }

            newFiles.push({
                file,
                preview,
                result: null,
                dimensions,
                copied: false,
                compressing: false,
            });
        }

        setFiles((prev) => [...prev, ...newFiles]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            handleFileChange(selectedFiles);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFileChange(droppedFiles);
        }
    };

    const getCompressionOptions = (): CompressionOptions => {
        return {
            mode: customQuality ? "quality" : "auto",
            quality: customQuality ? quality : undefined,
            maintainDimensions: true,
        };
    };

    const handleCompress = async (index: number) => {
        setFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, compressing: true } : f))
        );

        try {
            const options = getCompressionOptions();
            const result = await compressImage(files[index].file, options);

            setFiles((prev) =>
                prev.map((f, i) =>
                    i === index ? { ...f, result, compressing: false } : f
                )
            );
        } catch (error) {
            console.error("Compression failed:", error);
            setFiles((prev) =>
                prev.map((f, i) => (i === index ? { ...f, compressing: false } : f))
            );
        }
    };

    const handleCompressAll = async () => {
        const options = getCompressionOptions();

        setFiles((prev) => prev.map((f) => ({ ...f, compressing: true })));

        try {
            const results = await Promise.all(
                files.map((fileData) => compressImage(fileData.file, options))
            );

            setFiles((prev) =>
                prev.map((f, i) => ({
                    ...f,
                    result: results[i],
                    compressing: false,
                }))
            );
        } catch (error) {
            console.error("Compression failed:", error);
            setFiles((prev) => prev.map((f) => ({ ...f, compressing: false })));
        }
    };

    const handleDownload = (index: number) => {
        const fileData = files[index];
        if (!fileData.result) return;

        const originalName = fileData.file.name.replace(/\.[^/.]+$/, "");
        const extension = fileData.file.name.split(".").pop() || "jpg";
        const newFilename = `${originalName}_compressed.${extension}`;

        downloadBlob(fileData.result.blob, newFilename);
    };

    const handleDownloadAll = () => {
        files.forEach((fileData, index) => {
            if (fileData.result) {
                handleDownload(index);
            }
        });
    };

    const handleCopy = async (index: number) => {
        const fileData = files[index];
        if (!fileData.result) return;

        try {
            const item = new ClipboardItem({
                [fileData.result.blob.type]: fileData.result.blob,
            });
            await navigator.clipboard.write([item]);

            setFiles((prev) =>
                prev.map((f, i) => (i === index ? { ...f, copied: true } : f))
            );
            setTimeout(() => {
                setFiles((prev) =>
                    prev.map((f, i) => (i === index ? { ...f, copied: false } : f))
                );
            }, 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleRemove = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleReset = () => {
        setFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const allCompressed = files.length > 0 && files.every((f) => f.result !== null);

    return (
        <div className="w-full h-screen flex flex-col pt-14" >
            <div className="flex-1 overflow-y-auto py-16">
                <div className="flex flex-col items-center gap-6 max-w-3xl w-full mx-auto py-8 px-6">
                    <div className="text-center space-y-2">
                        <h1 className="font-semibold font-mono text-white/70 text-[clamp(1.5rem,5vw,2.5rem)] leading-[0.85] tracking-[-0.04em]">
                            image compression
                        </h1>
                        <p className="text-white/60 text-center max-w-md text-sm">
                            automatically compress with smart quality optimization
                        </p>
                    </div>

                    {/* Quality Control - Simple & Clean */}
                    <AnimatePresence>
                        {customQuality && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="w-full space-y-3 bg-white/5 border border-white/10 p-5"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Settings size={16} className="text-white/50" />
                                        <span className="text-white/70 text-sm">
                                            Quality: {Math.round(quality * 100)}%
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCustomQuality(false);
                                            setQuality(0.85);
                                        }}
                                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/70 transition-all text-xs cursor-pointer"
                                    >
                                        <X size={12} />
                                        Remove
                                    </button>
                                </div>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.05"
                                    value={quality}
                                    onChange={(e) => setQuality(Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
                                        [&::-webkit-slider-thumb]:appearance-none
                                        [&::-webkit-slider-thumb]:w-1
                                        [&::-webkit-slider-thumb]:h-4
                                        [&::-webkit-slider-thumb]:bg-white/70
                                        [&::-webkit-slider-thumb]:cursor-pointer
                                        [&::-webkit-slider-thumb]:hover:bg-white/90
                                        [&::-webkit-slider-thumb]:transition-colors
                                        [&::-moz-range-thumb]:w-1
                                        [&::-moz-range-thumb]:h-4
                                        [&::-moz-range-thumb]:bg-white/70
                                        [&::-moz-range-thumb]:border-0
                                        [&::-moz-range-thumb]:cursor-pointer
                                        [&::-moz-range-thumb]:hover:bg-white/90
                                        [&::-moz-range-thumb]:transition-colors"
                                />
                                <p className="text-white/40 text-xs text-center mt-1">
                                    {quality >= 0.9 ? "Higher quality, larger file" : quality >= 0.7 ? "Balanced quality and size" : "Smaller file, lower quality"}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!customQuality && (
                        <motion.button
                            onClick={() => setCustomQuality(true)}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:bg-white/8 hover:text-white/80 hover:border-white/20 transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.995 }}
                        >
                            <Settings size={16} className="text-white/50" />
                            Adjust compression quality (optional)
                        </motion.button>
                    )}

                    {/* File Upload Area */}
                    <div className="w-full space-y-4">
                        {files.length === 0 ? (
                            <label
                                className="block w-full cursor-pointer"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif"
                                    multiple
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                                <motion.div
                                    initial="rest"
                                    whileHover="hover"
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className={`w-full px-8 py-12 backdrop-blur-xl border-2 border-dashed text-white/60 flex flex-col items-center gap-3 cursor-pointer outline outline-transparent hover:outline-white/20 outline-offset-3 transition-colors ${
                                        isDragging
                                            ? "bg-white/15 border-white/40"
                                            : "bg-white/5 hover:bg-white/8 border-white/20"
                                    }`}
                                >
                                    <Upload size={32} strokeWidth={1.5} />
                                    <span className="text-sm">
                                        {isDragging ? "drop images here" : "click to select or drag & drop"}
                                    </span>
                                    <span className="text-xs text-white/40">
                                        supports JPEG, PNG, GIF • multiple files
                                    </span>
                                </motion.div>
                            </label>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    {files.map((fileData, index) => (
                                        <div
                                            key={index}
                                            className="relative w-full bg-white/5 border border-white/10 p-4 space-y-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={fileData.preview}
                                                    alt="Preview"
                                                    className="w-24 h-24 object-cover border border-white/10"
                                                />
                                                <div className="flex-1 space-y-2">
                                                    <p className="text-white/80 text-sm truncate">
                                                        {fileData.file.name}
                                                    </p>
                                                    {fileData.dimensions && (
                                                        <p className="text-xs text-white/50">
                                                            {fileData.dimensions.width} ×{" "}
                                                            {fileData.dimensions.height} px
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-white/50">
                                                        <span>
                                                            Original: {formatBytes(fileData.file.size)}
                                                        </span>
                                                        {fileData.result && (
                                                            <>
                                                                <span>→</span>
                                                                <span>
                                                                    Compressed:{" "}
                                                                    {formatBytes(
                                                                        fileData.result.compressedSize
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {fileData.result && (
                                                        <div className="text-xs">
                                                            {fileData.result.savedBytes > 0 ? (
                                                                <span className="text-green-400/80">
                                                                    saved{" "}
                                                                    {formatBytes(
                                                                        fileData.result.savedBytes
                                                                    )}{" "}
                                                                    ({fileData.result.savedPercentage}%)
                                                                </span>
                                                            ) : (
                                                                <span className="text-white/50">
                                                                    no compression possible
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <motion.button
                                                    onClick={() => handleRemove(index)}
                                                    className="p-2 bg-black/50 backdrop-blur-xl border border-white/10 text-white/80 hover:bg-black/70 transition-colors cursor-pointer"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <X size={16} />
                                                </motion.button>
                                            </div>

                                            {fileData.result && (
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        onClick={() => handleCopy(index)}
                                                        className="px-4 py-2 bg-white/10 border border-white/20 text-white/80 text-xs hover:bg-white/15 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                                        whileHover={{ scale: 1.01 }}
                                                        whileTap={{ scale: 0.99 }}
                                                    >
                                                        {fileData.copied ? (
                                                            <>
                                                                <Check size={14} />
                                                                copied
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy size={14} />
                                                                copy
                                                            </>
                                                        )}
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleDownload(index)}
                                                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white/80 text-xs hover:bg-white/15 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                                        whileHover={{ scale: 1.01 }}
                                                        whileTap={{ scale: 0.99 }}
                                                    >
                                                        <Download size={14} />
                                                        download
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    {!allCompressed ? (
                                        <>
                                            <motion.button
                                                onClick={handleCompressAll}
                                                disabled={files.some((f) => f.compressing)}
                                                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                                                whileHover={
                                                    !files.some((f) => f.compressing)
                                                        ? { scale: 1.01 }
                                                        : {}
                                                }
                                                whileTap={
                                                    !files.some((f) => f.compressing) ? { scale: 0.99 } : {}
                                                }
                                            >
                                                {files.some((f) => f.compressing)
                                                    ? "compressing..."
                                                    : `compress all (${files.length})`}
                                            </motion.button>
                                            <motion.button
                                                onClick={handleReset}
                                                className="px-6 py-3 bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/15 transition-all duration-200 cursor-pointer"
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                clear
                                            </motion.button>
                                        </>
                                    ) : (
                                        <>
                                            <motion.button
                                                onClick={handleDownloadAll}
                                                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/15 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                <Download size={16} />
                                                download all
                                            </motion.button>
                                            <motion.button
                                                onClick={handleReset}
                                                className="px-6 py-3 bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/15 transition-all duration-200 cursor-pointer"
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                clear
                                            </motion.button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-white/40 text-xs text-center max-w-md mt-2">
                        all processing happens locally in your browser • your files never leave your
                        device
                    </p>
                </div>
            </div>
        </div>
    );
}
