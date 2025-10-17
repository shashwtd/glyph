"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, X, ChevronDown, Copy, Check, ArrowLeftRight, AlertCircle } from "lucide-react";
import {
    convertImage,
    downloadBlob,
    getFileExtension,
    ImageFormat,
    FORMAT_LABELS,
    SUPPORTED_FORMATS,
    FORMAT_MIME_TYPES,
} from "@/utils/imageConverter";

interface FileWithPreview {
    file: File;
    preview: string;
    originalSize: number;
    convertedBlob: Blob | null;
    convertedSize: number;
    copied: boolean;
    error?: string;
    converting?: boolean;
}

interface ImageConverterProps {
    fromFormat: ImageFormat;
    toFormat: ImageFormat;
}

// Global storage for files to persist across route changes
const fileStorage = new Map<string, FileWithPreview[]>();

export default function ImageConverter({ fromFormat, toFormat }: ImageConverterProps) {
    const router = useRouter();
    const storageKey = useRef(`converter-files`).current;
    const [files, setFiles] = useState<FileWithPreview[]>(() => {
        // Initialize from storage if available
        return fileStorage.get(storageKey) || [];
    });
    const [converting, setConverting] = useState(false);
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [formatChangeNotice, setFormatChangeNotice] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fromDropdownRef = useRef<HTMLDivElement>(null);
    const toDropdownRef = useRef<HTMLDivElement>(null);
    const previousFormats = useRef({ from: fromFormat, to: toFormat });

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const MIN_FILE_SIZE = 100; // 100 bytes

    // Persist files to storage whenever they change
    useEffect(() => {
        if (files.length > 0) {
            fileStorage.set(storageKey, files);
        } else {
            fileStorage.delete(storageKey);
        }
    }, [files, storageKey]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                fromDropdownRef.current &&
                !fromDropdownRef.current.contains(event.target as Node)
            ) {
                setShowFromDropdown(false);
            }
            if (
                toDropdownRef.current &&
                !toDropdownRef.current.contains(event.target as Node)
            ) {
                setShowToDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle format changes - reset conversion state but keep files
    useEffect(() => {
        const formatChanged =
            previousFormats.current.from !== fromFormat ||
            previousFormats.current.to !== toFormat;

        if (formatChanged && files.length > 0) {
            // Show notice that files are being prepared for new conversion
            setFormatChangeNotice(true);
            setTimeout(() => setFormatChangeNotice(false), 3000);

            // Re-validate files against new source format and reset conversion state
            setFiles((prev) =>
                prev.map((f) => {
                    // Validate file against new fromFormat
                    const expectedMime = FORMAT_MIME_TYPES[fromFormat];
                    const actualMime = f.file.type;
                    const isJpegMatch =
                        fromFormat === "jpg" &&
                        (actualMime === "image/jpeg" || actualMime === "image/jpg");

                    let error: string | undefined = undefined;

                    if (actualMime !== expectedMime && !isJpegMatch) {
                        error = `File is ${getFormatFromMime(actualMime)}, expected ${FORMAT_LABELS[fromFormat]}`;
                    }

                    return {
                        ...f,
                        convertedBlob: null,
                        convertedSize: 0,
                        error,
                        converting: false,
                        copied: false,
                    };
                })
            );
        }

        // Update previous formats
        previousFormats.current = { from: fromFormat, to: toFormat };
    }, [fromFormat, toFormat]); // Removed files.length dependency

    // Auto-dismiss errors after 5 seconds
    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    const addError = (message: string) => {
        setErrors((prev) => [...prev, message]);
    };

    const validateFile = (file: File): { valid: boolean; error?: string } => {
        // Check if file exists and has content
        if (!file || file.size === 0) {
            return { valid: false, error: `Empty file: ${file?.name || "Unknown"}` };
        }

        // Check minimum file size
        if (file.size < MIN_FILE_SIZE) {
            return { valid: false, error: `${file.name} is too small (minimum 100 bytes)` };
        }

        // Check maximum file size
        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `${file.name} is too large (maximum 50MB)`,
            };
        }

        // Check if it's an image file
        if (!file.type.startsWith("image/")) {
            return {
                valid: false,
                error: `${file.name} is not an image file`,
            };
        }

        // Check if the format matches the expected source format
        const expectedMime = FORMAT_MIME_TYPES[fromFormat];
        const actualMime = file.type;

        // Special handling for JPEG (can be image/jpeg or image/jpg)
        const isJpegMatch =
            fromFormat === "jpg" &&
            (actualMime === "image/jpeg" || actualMime === "image/jpg");

        if (actualMime !== expectedMime && !isJpegMatch) {
            return {
                valid: false,
                error: `${file.name} is ${getFormatFromMime(actualMime)}, expected ${FORMAT_LABELS[fromFormat]}`,
            };
        }

        return { valid: true };
    };

    const getFormatFromMime = (mime: string): string => {
        const entry = Object.entries(FORMAT_MIME_TYPES).find(([_, m]) => m === mime);
        return entry ? FORMAT_LABELS[entry[0] as ImageFormat] : mime;
    };

    const validateImage = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                // Check for valid dimensions
                if (img.width === 0 || img.height === 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(false);
            };

            img.src = url;
        });
    };

    const handleFileChange = async (selectedFiles: FileList) => {
        const newFiles: FileWithPreview[] = [];
        const errorMessages: string[] = [];
        const existingFileNames = new Set(files.map((f) => f.file.name));

        for (const file of Array.from(selectedFiles)) {
            // Check for duplicates
            if (existingFileNames.has(file.name)) {
                errorMessages.push(`${file.name} is already added`);
                continue;
            }

            // Validate file
            const validation = validateFile(file);
            if (!validation.valid) {
                errorMessages.push(validation.error!);
                continue;
            }

            // Validate image integrity
            const isValidImage = await validateImage(file);
            if (!isValidImage) {
                errorMessages.push(`${file.name} is corrupted or invalid`);
                continue;
            }

            // Create preview
            try {
                const reader = new FileReader();
                const preview = await new Promise<string>((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = () => reject(new Error("Failed to read file"));
                    reader.readAsDataURL(file);
                });

                newFiles.push({
                    file,
                    preview,
                    originalSize: file.size,
                    convertedBlob: null,
                    convertedSize: 0,
                    copied: false,
                });
            } catch (error) {
                errorMessages.push(`Failed to read ${file.name}`);
            }
        }

        if (errorMessages.length > 0) {
            errorMessages.forEach((msg) => addError(msg));
        }

        if (newFiles.length > 0) {
            setFiles((prev) => [...prev, ...newFiles]);
        }
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
        const imageFiles = Array.from(droppedFiles).filter((file) =>
            file.type.startsWith("image/")
        );
        
        if (imageFiles.length > 0) {
            const fileList = new DataTransfer();
            imageFiles.forEach((file) => fileList.items.add(file));
            handleFileChange(fileList.files);
        }
    };

    const handleConvert = async (index: number) => {
        setFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, converting: true, error: undefined } : f))
        );

        try {
            const fileData = files[index];

            // Validate before conversion
            if (fileData.file.size === 0) {
                throw new Error("File is empty");
            }

            const blob = await convertImage(fileData.file, toFormat);

            // Validate conversion result
            if (!blob || blob.size === 0) {
                throw new Error("Conversion produced empty result");
            }

            setFiles((prev) =>
                prev.map((f, i) =>
                    i === index
                        ? {
                              ...f,
                              convertedBlob: blob,
                              convertedSize: blob.size,
                              converting: false,
                          }
                        : f
                )
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Conversion failed";
            setFiles((prev) =>
                prev.map((f, i) =>
                    i === index
                        ? {
                              ...f,
                              error: errorMessage,
                              converting: false,
                          }
                        : f
                )
            );
            addError(`${files[index].file.name}: ${errorMessage}`);
        }
    };

    const handleConvertAll = async () => {
        setConverting(true);
        setFiles((prev) =>
            prev.map((f) => ({ ...f, converting: true, error: undefined }))
        );

        try {
            const results = await Promise.allSettled(
                files.map((fileData) => convertImage(fileData.file, toFormat))
            );

            setFiles((prev) =>
                prev.map((f, i) => {
                    const result = results[i];

                    if (result.status === "fulfilled") {
                        const blob = result.value;

                        // Validate result
                        if (!blob || blob.size === 0) {
                            return {
                                ...f,
                                error: "Conversion produced empty result",
                                converting: false,
                            };
                        }

                        return {
                            ...f,
                            convertedBlob: blob,
                            convertedSize: blob.size,
                            converting: false,
                        };
                    } else {
                        const errorMessage =
                            result.reason instanceof Error
                                ? result.reason.message
                                : "Conversion failed";
                        addError(`${f.file.name}: ${errorMessage}`);
                        return {
                            ...f,
                            error: errorMessage,
                            converting: false,
                        };
                    }
                })
            );
        } catch (error) {
            addError("Batch conversion failed");
            setFiles((prev) => prev.map((f) => ({ ...f, converting: false })));
        } finally {
            setConverting(false);
        }
    };

    const handleDownload = (index: number) => {
        const fileData = files[index];
        if (!fileData.convertedBlob) return;
        const originalName = fileData.file.name.replace(/\.[^/.]+$/, "");
        const newFilename = `${originalName}.${getFileExtension(toFormat)}`;
        downloadBlob(fileData.convertedBlob, newFilename);
    };

    const handleDownloadAll = () => {
        files.forEach((fileData, index) => {
            if (fileData.convertedBlob) {
                handleDownload(index);
            }
        });
    };

    const handleCopy = async (index: number) => {
        const fileData = files[index];
        if (!fileData.convertedBlob) return;
        
        try {
            const item = new ClipboardItem({ [fileData.convertedBlob.type]: fileData.convertedBlob });
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
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleReset = () => {
        setFiles([]);
        fileStorage.delete(storageKey);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFormatChange = (type: "from" | "to", format: ImageFormat) => {
        const newFrom = type === "from" ? format : fromFormat;
        const newTo = type === "to" ? format : toFormat;
        
        if (newFrom !== newTo) {
            router.push(`/${newFrom}-to-${newTo}`);
        }
        
        setShowFromDropdown(false);
        setShowToDropdown(false);
    };

    const handleSwapFormats = () => {
        if (fromFormat === toFormat) {
            return;
        }

        setShowFromDropdown(false);
        setShowToDropdown(false);
        router.push(`/${toFormat}-to-${fromFormat}`);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const getSizeSaved = (originalSize: number, convertedSize: number) => {
        if (originalSize === 0 || convertedSize === 0) return null;
        const saved = originalSize - convertedSize;
        const percentage = Math.round((saved / originalSize) * 100);
        return { saved, percentage };
    };

    const allConverted = files.length > 0 && files.every((f) => f.convertedBlob !== null || f.error);
    const hasErrors = files.some((f) => f.error);
    const anyConverting = files.some((f) => f.converting);

    return (
        <div className="w-full h-screen flex flex-col pt-14">
            <div className="flex-1 overflow-y-auto py-16">
                <div className="flex flex-col items-center gap-6 max-w-2xl w-full mx-auto py-8 px-6">
                    <div className="flex items-center gap-4">
                        <FormatSelector
                            ref={fromDropdownRef}
                            format={fromFormat}
                            isOpen={showFromDropdown}
                            onToggle={() => setShowFromDropdown(!showFromDropdown)}
                            onSelect={(format) => handleFormatChange("from", format)}
                            excludeFormat={toFormat}
                        />
                        <motion.button
                            type="button"
                            onClick={handleSwapFormats}
                            className="p-2 rounded-full border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors shrink-0 cursor-pointer"
                            aria-label="swap conversion direction"
                            whileHover={{ rotate: 180, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ArrowLeftRight size={20} />
                        </motion.button>

                        <FormatSelector
                            ref={toDropdownRef}
                            format={toFormat}
                            isOpen={showToDropdown}
                            onToggle={() => setShowToDropdown(!showToDropdown)}
                            onSelect={(format) => handleFormatChange("to", format)}
                            excludeFormat={fromFormat}
                        />
                    </div>

                    <p className="text-white/60 text-center max-w-md">
                        convert your images in-browser, no upload required
                    </p>

                    {/* Format Change Notice */}
                    <AnimatePresence>
                        {formatChangeNotice && files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full"
                            >
                                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 text-blue-200/90 text-sm">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>
                                        Files prepared for {FORMAT_LABELS[fromFormat]} → {FORMAT_LABELS[toFormat]} conversion
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Notifications */}
                    <AnimatePresence>
                        {errors.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full space-y-2"
                            >
                                {errors.map((error, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-200/90 text-sm"
                                    >
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <span className="flex-1">{error}</span>
                                        <button
                                            onClick={() =>
                                                setErrors((prev) =>
                                                    prev.filter((_, i) => i !== index)
                                                )
                                            }
                                            className="text-red-200/60 hover:text-red-200 cursor-pointer"
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                            accept={FORMAT_MIME_TYPES[fromFormat]}
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
                                {FORMAT_LABELS[fromFormat]} files only • multiple files supported
                            </span>
                        </motion.div>
                    </label>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            {files.map((fileData, index) => {
                                const sizeSaved = getSizeSaved(fileData.originalSize, fileData.convertedSize);
                                
                                return (
                                    <div key={index} className="relative w-full bg-white/5 border border-white/10 p-4 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={fileData.preview}
                                                alt="Preview"
                                                className="w-24 h-24 object-cover border border-white/10"
                                            />
                                            <div className="flex-1 space-y-2">
                                                <p className="text-white/80 text-sm truncate">{fileData.file.name}</p>
                                                <div className="flex items-center gap-4 text-xs text-white/50">
                                                    <span>Original: {formatBytes(fileData.originalSize)}</span>
                                                    {fileData.convertedSize > 0 && (
                                                        <>
                                                            <span>→</span>
                                                            <span>Converted: {formatBytes(fileData.convertedSize)}</span>
                                                        </>
                                                    )}
                                                </div>
                                                {fileData.error && (
                                                    <div className="flex items-center gap-1.5 text-xs text-red-300/90">
                                                        <AlertCircle size={12} />
                                                        <span>{fileData.error}</span>
                                                    </div>
                                                )}
                                                {!fileData.error && sizeSaved && (
                                                    <div className="text-xs">
                                                        {sizeSaved.saved > 0 ? (
                                                            <span className="text-green-400/80">
                                                                saved {formatBytes(sizeSaved.saved)} ({sizeSaved.percentage}%)
                                                            </span>
                                                        ) : (
                                                            <span className="text-white/50">
                                                                {sizeSaved.percentage < 0 ? `+${formatBytes(Math.abs(sizeSaved.saved))}` : "same size"}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {fileData.converting && (
                                                    <div className="text-xs text-white/60">
                                                        converting...
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

                                        {fileData.convertedBlob && !fileData.error && (
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
                                );
                            })}
                        </div>

                        <div className="flex gap-3">
                            {!allConverted ? (
                                <>
                                    <motion.button
                                        onClick={handleConvertAll}
                                        disabled={anyConverting}
                                        className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                                        whileHover={!anyConverting ? { scale: 1.01 } : {}}
                                        whileTap={!anyConverting ? { scale: 0.99 } : {}}
                                    >
                                        {anyConverting ? "converting..." : `convert all (${files.length})`}
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
                                    {!hasErrors && (
                                        <motion.button
                                            onClick={handleDownloadAll}
                                            className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/15 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            <Download size={16} />
                                            download all
                                        </motion.button>
                                    )}
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
                all processing happens locally in your browser • your files never leave your device
            </p>
                </div>
            </div>
        </div>
    );
}

const FormatSelector = React.forwardRef<
    HTMLDivElement,
    {
        format: ImageFormat;
        isOpen: boolean;
        onToggle: () => void;
        onSelect: (format: ImageFormat) => void;
        excludeFormat: ImageFormat;
    }
>(({ format, isOpen, onToggle, onSelect, excludeFormat }, ref) => {
    return (
        <div ref={ref} className="relative">
            <motion.button
                onClick={onToggle}
                className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <span className="font-semibold font-mono text-white/70 text-[clamp(1.5rem,5vw,2.5rem)] leading-[0.85] tracking-[-0.04em]">
                    {FORMAT_LABELS[format].toLowerCase()}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={20} className="text-white/40" />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 w-full bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden z-50"
                    >
                        {SUPPORTED_FORMATS.filter((f) => f !== excludeFormat).map((fmt) => (
                            <motion.button
                                key={fmt}
                                onClick={() => onSelect(fmt)}
                                className="w-full px-4 py-2.5 text-left text-white/70 hover:bg-white/10 hover:text-white/90 transition-colors text-sm cursor-pointer"
                                whileHover={{ x: 4 }}
                            >
                                {FORMAT_LABELS[fmt]}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

FormatSelector.displayName = "FormatSelector";
