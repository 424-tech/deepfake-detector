"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Smartphone, Activity, Cpu, ChevronDown, ChevronUp, Database } from "lucide-react";

interface AnalysisResult {
    local?: {
        prediction: boolean;
        confidence: number;
        feature_analysis?: Record<string, number>;
        risk_assessment?: {
            level: string;
            description: string;
            color: string;
        }
    };
    reality_defender?: {
        status?: string;
        score?: number;
        models?: any[];
        error?: string;
        [key: string]: any;
    };
    status: string;
}

interface ResultsDashboardProps {
    result: AnalysisResult | null;
    imageUrl: string | null;
}

export default function ResultsDashboard({ result, imageUrl }: ResultsDashboardProps) {
    const [showJson, setShowJson] = useState(false);

    if (!result || !imageUrl) return null;

    // --- MERGE LOGIC ---
    // Reality Defender (RD) is the gold standard. We prioritize its findings.
    const rdData = result.reality_defender;
    const localData = result.local;

    // 1. Determine if it's a deepfake (priority to RD)
    let isDeepfake = false;
    if (rdData && rdData.status) {
        isDeepfake = rdData.status.toUpperCase() === "MANIPULATED";
    } else if (localData) {
        isDeepfake = localData.prediction;
    }

    // 2. Determine confidence (priority to RD score)
    let rawConfidence = 0;
    if (rdData && rdData.score !== undefined) {
        rawConfidence = rdData.score;
    } else if (localData) {
        rawConfidence = localData.confidence;
    }

    // Defensive check: Ensure confidence is a valid number
    const confidence = isNaN(Number(rawConfidence)) ? 0 : Number(rawConfidence);

    // 3. Risk description
    const riskDescription = rdData?.status === "MANIPULATED"
        ? `REALITY DEFENDER VERDICT: Manipulation identified with ${(confidence * 100).toFixed(1)}% probability. Several forensic models detected algorithmic artifacts.`
        : localData?.risk_assessment?.description || "Analysis complete. Review individual feature vectors for details.";

    const features = localData?.feature_analysis || {};

    // --- THEME ---
    const themeColor = isDeepfake ? "text-[#FF7F50]" : "text-emerald-600";
    const borderColor = isDeepfake ? "border-[#FF7F50]" : "border-emerald-600";
    const statusText = isDeepfake ? "MANIPULATION DETECTED" : "AUTHENTICITY VERIFIED";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mx-auto space-y-8"
        >
            {/* Status Header */}
            <div className={`p-6 border-l-4 ${borderColor} bg-white shadow-sm flex items-center justify-between border-y border-r border-[#0B123B]/10`}>
                <div className="flex items-center gap-4">
                    {isDeepfake ? <AlertTriangle className="w-6 h-6 text-[#FF7F50]" /> : <CheckCircle className="w-6 h-6 text-emerald-600" />}

                    <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#0B123B]/50 mb-1">ANALYSIS RESULT</div>
                        <h2 className={`text-2xl font-black tracking-tight uppercase ${themeColor}`}>
                            {statusText}
                        </h2>
                    </div>
                </div>
                <div className="hidden sm:block text-right">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#0B123B]/50 mb-1">CONFIDENCE MATRIX</div>
                    <div className="font-mono text-xl font-bold text-[#0B123B]">
                        {(confidence * 100).toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Col: Evidence Image */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="relative border border-[#0B123B]/10 bg-white p-2">
                        {/* Technical Corners */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#0B123B]"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#0B123B]"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#0B123B]"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#0B123B]"></div>

                        <img
                            src={imageUrl}
                            alt="Evidence"
                            className="w-full h-auto object-cover max-h-[600px] grayscale-[10%]"
                        />

                        <div className="mt-2 flex justify-between items-center px-1">
                            <span className="text-[10px] font-mono text-[#0B123B]/60">IMG_SOURCE_RAW</span>
                            <span className="text-[10px] font-mono text-[#0B123B]/60">VERDICT_ID: {rdData?.request_id?.slice(0, 8).toUpperCase() || 'LOCAL_SCAN'}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Col: Forensic Data */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    {/* Primary Meter */}
                    <div className="p-8 bg-[#FDFBF7] border border-[#0B123B]/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Cpu className="w-32 h-32 text-[#0B123B]" />
                        </div>

                        <h3 className="text-xs uppercase tracking-widest text-[#0B123B]/60 font-bold mb-6">AI PROBABILITY SCORE</h3>

                        <div className="flex items-baseline gap-2 mb-4">
                            <span className={`text-6xl sm:text-7xl font-black ${themeColor} tracking-tighter`}>{(confidence * 100).toFixed(0)}</span>
                            <span className="text-xl sm:text-2xl font-bold text-[#0B123B]/40">%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-[#0B123B]/5 w-full mb-6">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${confidence * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${isDeepfake ? 'bg-[#FF7F50]' : 'bg-emerald-600'}`}
                            />
                        </div>

                        <div className="space-y-4">
                            <p className="text-[#0B123B] text-sm font-medium leading-relaxed font-mono">
                                {riskDescription}
                            </p>

                            {rdData && rdData.models && (
                                <div className="pt-2 border-t border-[#0B123B]/5">
                                    <div className="text-[9px] font-mono uppercase tracking-widest text-[#0B123B]/40 mb-2">Active Forensic Models</div>
                                    <div className="flex flex-wrap gap-2">
                                        {rdData.models.map((model: any, i: number) => {
                                            const modelScore = isNaN(Number(model.score)) ? 0 : Number(model.score);
                                            return (
                                                <span key={i} className={`px-2 py-1 text-[9px] font-mono border ${model.status === 'MANIPULATED' ? 'border-[#FF7F50]/20 text-[#FF7F50] bg-[#FF7F50]/5' : 'border-[#0B123B]/10 text-[#0B123B]/60'}`}>
                                                    {model.name}: {(modelScore * 100).toFixed(0)}%
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feature Analysis */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] uppercase tracking-widest text-[#0B123B]/50 font-bold mb-2">LOCAL FORENSIC VECTORS</h4>
                        {Object.entries(features).map(([key, rawScore], idx) => {
                            const score = isNaN(Number(rawScore)) ? 0 : Number(rawScore);
                            return (
                                <div key={key} className="flex items-center gap-4 text-xs font-mono">
                                    <span className="w-24 text-[#0B123B]/70 uppercase text-right">{key.replace(/_/g, " ")}</span>
                                    <div className="flex-grow h-6 bg-[#0B123B]/5 relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score * 100}%` }}
                                            transition={{ delay: 0.1 * idx, duration: 0.8 }}
                                            className="h-full bg-[#0B123B]"
                                        />
                                    </div>
                                    <span className="w-12 text-[#0B123B] font-bold">{(score * 100).toFixed(0)}%</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Reality Defender Deep Link (Prototype Match) */}
                    <div className="border border-[#0B123B]/10 bg-white">
                        <button
                            onClick={() => setShowJson(!showJson)}
                            className="w-full px-4 py-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#0B123B] hover:bg-[#0B123B]/5 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Database className="w-3 h-3" />
                                View Technical Metadata (RD JSON)
                            </div>
                            {showJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <AnimatePresence>
                            {showJson && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-[#0B123B]/10"
                                >
                                    <pre className="p-4 text-[10px] font-mono text-blue-600 overflow-x-auto whitespace-pre-wrap bg-[#0B123B]/5 max-h-[400px]">
                                        {JSON.stringify(rdData || { message: "No RD metadata available in this scan instance." }, null, 2)}
                                    </pre>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </motion.div>
            </div>
        </motion.div>
    );
}
