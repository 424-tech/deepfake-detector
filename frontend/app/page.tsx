"use client";

import { useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import Dropzone from "@/components/Dropzone";
import ResultsDashboard from "@/components/ResultsDashboard";
import SkeletonLoader from "@/components/SkeletonLoader";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [analysisPhase, setAnalysisPhase] = useState<'upload' | 'local' | 'external' | 'finalizing'>('upload');

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsProcessing(true);
        setResult(null);
        setError(null);
        setAnalysisPhase('upload');

        // Create immediate preview
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);

        // Prepare upload
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            // Call full analysis endpoint (Local + Reality Defender)
            // Phase: Local Forensics (starts immediately after upload)
            setAnalysisPhase('local');

            // Timeout set to 120 seconds (120000ms) to allow for deep debugging of long processes
            const response = await axios.post("/api/v1/analyze/full", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 120000,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.progress && progressEvent.progress < 1) {
                        setAnalysisPhase('upload');
                    } else {
                        setAnalysisPhase('local');
                    }
                }
            });

            // Note: In a real streaming API we'd update phases more granularly.
            // For now we simulate the transitions or just move to finalizing.
            setAnalysisPhase('finalizing');
            setResult(response.data.results);
        } catch (err: any) {
            console.error("Analysis Error Details:", {
                message: err.message,
                response: err.response,
                code: err.code,
                config: err.config
            });

            let errorMessage = "Analysis failed. Please ensure the backend is running.";

            if (err.code === 'ECONNABORTED') {
                errorMessage = "Analysis timed out. The forensic process is taking longer than expecting.";
            } else if (err.response) {
                errorMessage = `Server Error (${err.response.status}): ${err.response.data?.detail || err.message}`;
            } else if (err.message === "Network Error") {
                errorMessage = "Network Error: Could not connect to backend. Check CORS or Server Status.";
            }

            setError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#FDFBF7]">

            <div className="relative z-10 container mx-auto px-4 pt-32 pb-12 flex-grow flex flex-col justify-center items-center">

                {/* Hero Headers */}
                <AnimatePresence>
                    {!file && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-10 max-w-4xl relative z-10"
                        >
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#0B123B] mb-6 uppercase leading-[0.9]">
                                Is this<br />Real?
                            </h1>
                            <p className="text-lg md:text-xl font-medium text-[#0B123B]/80 max-w-2xl mx-auto leading-relaxed tracking-wide font-mono">
                                UPLOAD MEDIA FOR INSTANT <span className="text-[#FF7F50] font-bold">FORENSIC ANALYSIS</span>.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload / Results Zone */}
                <motion.div
                    layout
                    className="w-full max-w-3xl relative z-10"
                >
                    <AnimatePresence mode="wait">
                        {!file ? (
                            <motion.div
                                key="dropzone"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Dropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />

                                <div className="mt-8 flex justify-center gap-8 text-xs text-slate-500 font-medium tracking-wide">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                                        SECURE UPLOAD
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50"></span>
                                        AI POWERED
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
                                        PRIVACY FIRST
                                    </span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full"
                            >
                                {/* Controls Header */}
                                <div className="flex justify-between items-center mb-6 px-1">
                                    <button
                                        onClick={handleReset}
                                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <span className="text-lg">←</span> Analyze Another File
                                    </button>
                                    <div className="px-3 py-1 rounded-full bg-slate-900/50 text-xs font-mono text-slate-500 border border-slate-800">
                                        ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                                    </div>
                                </div>

                                {isProcessing ? (
                                    <SkeletonLoader
                                        phase={analysisPhase}
                                        status={
                                            analysisPhase === 'upload' ? 'UPLOADING EVIDENCE...' :
                                                analysisPhase === 'local' ? 'LOCAL FORENSIC SCAN...' :
                                                    analysisPhase === 'external' ? 'REALITY DEFENDER VERIFICATION...' :
                                                        'FINALIZING ANALYSIS...'
                                        }
                                    />
                                ) : error ? (
                                    <div className="p-8 border border-red-500/20 bg-red-500/5 rounded-2xl text-center">
                                        <div className="text-red-400 font-medium mb-2">Analysis Failed</div>
                                        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">{error}</p>
                                        <button
                                            onClick={handleReset}
                                            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <ResultsDashboard result={result} imageUrl={previewUrl} />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

            </div>

            <footer className="relative z-10 py-8 text-center">
                <p className="text-slate-600 text-xs font-medium">
                    &copy; 2024 DEEPFAKE CHECK • PROTECTING DIGITAL INTEGRITY
                </p>
            </footer>

        </div>
    );
}
