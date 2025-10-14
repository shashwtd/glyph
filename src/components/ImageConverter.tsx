"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, X, ChevronDown, Copy, Check } from "lucide-react";
import {
    convertImage,
    downloadBlob,
    getFileExtension,
    ImageFormat,
    FORMAT_LABELS,
    SUPPORTED_FORMATS,
} from "@/utils/imageConverter";

interface FileWithPreview {
    file: File;
    preview: string;
    originalSize: number;
    convertedBlob: Blob | null;
    convertedSize: number;
    copied: boolean;
}

interface ImageConverterProps {
    fromFormat: ImageFormat;
    toFormat: ImageFormat;
}

export default function ImageConverter({ fromFormat, toFormat }: ImageConverterProps) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [converting, setConverting] = useState(false);
    const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [originalSize, setOriginalSize] = useState(0);
    const [convertedSize, setConvertedSize] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fromDropdownRef = useRef<HTMLDivElement>(null);
    const toDropdownRef = useRef<HTMLDivElement>(null);

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

    const handleFileChange = (selectedFiles: FileList) => {
        const newFiles: FileWithPreview[] = [];
        
        Array.from(selectedFiles).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newFiles.push({
                    file,
                    preview: e.target?.result as string,
                    originalSize: file.size,
                    convertedBlob: null,
                    convertedSize: 0,
                    copied: false,
                });
                
                if (newFiles.length === selectedFiles.length) {
                    setFiles((prev) => [...prev, ...newFiles]);
                }
            };
            reader.readAsDataURL(file);
        });
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
        setConverting(true);
        try {
            const blob = await convertImage(files[index].file, toFormat);
            setFiles((prev) =>
                prev.map((f, i) =>
                    i === index
                        ? { ...f, convertedBlob: blob, convertedSize: blob.size }
                        : f
                )
            );
        } catch (error) {
            console.error("Conversion failed:", error);
        } finally {
            setConverting(false);
        }
    };

    const handleConvertAll = async () => {
        setConverting(true);
        try {
            const promises = files.map((fileData) =>
                convertImage(fileData.file, toFormat)
            );
            const blobs = await Promise.all(promises);
            
            setFiles((prev) =>
                prev.map((f, i) => ({
                    ...f,
                    convertedBlob: blobs[i],
                    convertedSize: blobs[i].size,
                }))
            );
        } catch (error) {
            console.error("Conversion failed:", error);
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

    const handleCopy = async () => {
        if (!convertedBlob) return;
        
        try {
            const item = new ClipboardItem({ [convertedBlob.type]: convertedBlob });
            await navigator.clipboard.write([item]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setConvertedBlob(null);
        setOriginalSize(0);
        setConvertedSize(0);
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

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const getSizeSaved = () => {
        if (originalSize === 0 || convertedSize === 0) return null;
        const saved = originalSize - convertedSize;
        const percentage = Math.round((saved / originalSize) * 100);
        return { saved, percentage };
    };

    const sizeSaved = getSizeSaved();

    return (
        <div className="flex flex-col items-center gap-6 max-w-2xl w-full">
            <div className="flex items-center gap-4">
                <FormatSelector
                    format={fromFormat}
                    isOpen={showFromDropdown}
                    onToggle={() => setShowFromDropdown(!showFromDropdown)}
                    onSelect={(format) => handleFormatChange("from", format)}
                    excludeFormat={toFormat}
                />
                
                <svg width="48" height="24" viewBox="0 0 48 24" className="text-white/30">
                    <path
                        d="M2 12 L46 12 M46 12 L38 6 M46 12 L38 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                
                <FormatSelector
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

            <div className="w-full space-y-4">
                {!file ? (
                    <label 
                        className="block w-full"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
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
                                {isDragging ? "drop image here" : "click to select or drag & drop"}
                            </span>
                        </motion.div>
                    </label>
                ) : (
                    <div className="space-y-4">
                        <div className="relative w-full bg-white/5 border border-white/10 p-4">
                            {preview && (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-auto max-h-64 object-contain"
                                />
                            )}
                            <motion.button
                                onClick={handleReset}
                                className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-xl border border-white/10 text-white/80 hover:bg-black/70 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <X size={16} />
                            </motion.button>
                        </div>

                        {convertedBlob && sizeSaved && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center text-sm text-white/60"
                            >
                                {sizeSaved.saved > 0 ? (
                                    <span className="text-green-400/80">
                                        saved {formatBytes(sizeSaved.saved)} ({sizeSaved.percentage}%)
                                    </span>
                                ) : (
                                    <span className="text-white/50">
                                        {formatBytes(convertedSize)} • {sizeSaved.percentage > 0 ? "larger" : "same size"}
                                    </span>
                                )}
                            </motion.div>
                        )}

                        <div className="flex gap-3">
                            {!convertedBlob ? (
                                <motion.button
                                    onClick={handleConvert}
                                    disabled={converting}
                                    className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    whileHover={!converting ? { scale: 1.01 } : {}}
                                    whileTap={!converting ? { scale: 0.99 } : {}}
                                >
                                    {converting ? "converting..." : "convert"}
                                </motion.button>
                            ) : (
                                <>
                                    <motion.button
                                        onClick={handleCopy}
                                        className="px-6 py-3 bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/15 transition-all duration-200 flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        {copied ? (
                                            <>
                                                <Check size={16} />
                                                copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} />
                                                copy
                                            </>
                                        )}
                                    </motion.button>
                                    <motion.button
                                        onClick={handleDownload}
                                        className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/15 transition-all duration-200 flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <Download size={16} />
                                        download
                                    </motion.button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function FormatSelector({
    format,
    isOpen,
    onToggle,
    onSelect,
    excludeFormat,
}: {
    format: ImageFormat;
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (format: ImageFormat) => void;
    excludeFormat: ImageFormat;
}) {
    return (
        <div className="relative">
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
                                className="w-full px-4 py-2.5 text-left text-white/70 hover:bg-white/10 hover:text-white/90 transition-colors text-sm"
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
}
