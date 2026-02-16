"use client";

import { useState, useRef, useCallback } from "react";
import { Scan, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface DropzoneProps {
    onFileSelect: (file: File) => void;
    isProcessing: boolean;
}

export default function Dropzone({ onFileSelect, isProcessing }: DropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isProcessing) setIsDragActive(true);
    }, [isProcessing]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const validateAndProcessFile = (file: File) => {
        setError(null);
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
            setError("ERR: INVALID_FILE_TYPE");
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            setError("ERR: SIZE_EXCEEDED_15MB");
            return;
        }
        onFileSelect(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (isProcessing) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndProcessFile(e.dataTransfer.files[0]);
        }
    }, [isProcessing, onFileSelect]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndProcessFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full mx-auto my-12 relative max-w-2xl">
            {/* Technical Decorators */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#0B123B]"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#0B123B]"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#0B123B]"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#0B123B]"></div>

            <motion.div
                onClick={() => inputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                whileHover={!isProcessing ? { backgroundColor: "rgba(11, 18, 59, 0.02)" } : {}}
                className={clsx(
                    "relative min-h-[320px] cursor-pointer",
                    "flex flex-col items-center justify-center p-10 text-center",
                    "border border-dashed border-[#0B123B]/30 bg-[#FFF]",
                    "transition-all duration-300",
                    isDragActive && "border-[#FF7F50] bg-[#FF7F50]/5",
                    isProcessing && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleInputChange}
                    disabled={isProcessing}
                />

                <div className="space-y-6 pointer-events-none">
                    <motion.div
                        animate={{ scale: isDragActive ? 1.1 : 1 }}
                        className="flex justify-center"
                    >
                        <div className="p-0">
                            <Scan className={clsx("w-16 h-16 stroke-[1.5]", isDragActive ? "text-[#FF7F50]" : "text-[#0B123B]")} />
                        </div>
                    </motion.div>

                    <div>
                        <h3 className="text-display text-2xl text-[#0B123B] tracking-wide mb-3">
                            {isDragActive ? "RELEASE TO SCAN" : "INITIATE SCAN"}
                        </h3>
                        <p className="text-mono-technical">
                            DRAG EVIDENCE HERE OR CLICK TO BROWSE
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-4 px-4 py-2 border border-[#0B123B]/10 bg-[#FDFBF7]">
                        <span className="text-[10px] font-mono font-bold text-[#0B123B]">FORMATS: JPG / PNG / WEBP</span>
                        <div className="w-[1px] h-3 bg-[#0B123B]/20"></div>
                        <span className="text-[10px] font-mono font-bold text-[#0B123B]">MAX: 15MB</span>
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-6 left-0 right-0 mx-auto w-fit flex items-center gap-2 px-4 py-2 bg-[#FF7F50]/10 text-[#FF7F50] border border-[#FF7F50]"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-mono-technical font-bold text-[#FF7F50]">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
}
