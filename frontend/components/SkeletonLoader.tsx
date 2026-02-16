"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SkeletonLoaderProps {
    status?: string;
    phase?: 'upload' | 'local' | 'external' | 'finalizing';
}

const LOG_MESSAGES = {
    upload: [
        "INITIALIZING SECURE UPLINK...",
        "FRAGMENTING EVIDENCE DATA...",
        "ESTABLISHING ENCRYPTED TUNNEL...",
        "UPLOADING TO FORENSIC SERVER..."
    ],
    local: [
        "EXECUTING LOCAL FORENSIC SUITE...",
        "ANALYZING SPECTRAL ANOMALIES...",
        "MAPPING FACIAL GEOMETRY VECTORS...",
        "CHECKING PIXEL COHERENCE..."
    ],
    external: [
        "EXTERNAL API HANDSHAKE...",
        "CONSULTING REALITY DEFENDER NODES...",
        "WAITING FOR DEEP SCAN RESULTS...",
        "SYNCHRONIZING CROSS-PROVIDER DATA..."
    ],
    finalizing: [
        "COMPILING FINAL REPORT...",
        "CALCULATING RISK MATRICES...",
        "VERIFYING DATA INTEGRITY...",
        "READYING DASHBOARD..."
    ]
};

export default function SkeletonLoader({ status = "ANALYZING EVIDENCE...", phase = 'local' }: SkeletonLoaderProps) {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const possibleLogs = LOG_MESSAGES[phase] || LOG_MESSAGES.local;
            const newLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
            setLogs(prev => [newLog, ...prev].slice(0, 5));
        }, 1500);

        return () => clearInterval(interval);
    }, [phase]);

    return (
        <div className="w-full max-w-7xl mx-auto mt-12 space-y-8">
            {/* Status Header */}
            <div className="flex justify-between items-end border-b border-[#0B123B]/10 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7F50] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7F50]"></span>
                        </span>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#0B123B]/40 uppercase">
                            SCAN STATUS: IN_PROGRESS
                        </span>
                    </div>
                    <h2 className="text-3xl font-black text-[#0B123B] tracking-tight uppercase">
                        {status}
                    </h2>
                </div>
                <div className="text-right hidden md:block">
                    <span className="text-[10px] font-mono text-[#0B123B]/40 block uppercase mb-1">Processing Node</span>
                    <span className="text-sm font-mono font-bold text-[#0B123B]">PHX-0822-FORENSIC</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Forensic Pulse */}
                <div className="aspect-video bg-[#0B123B] rounded-sm relative overflow-hidden flex items-center justify-center p-12">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(#FDFBF7 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />

                    {/* The Pulse */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-48 h-48 border-2 border-[#FF7F50] rounded-full flex items-center justify-center relative"
                    >
                        <div className="w-32 h-32 border border-[#FF7F50]/50 rounded-full animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-mono text-[#FF7F50] font-bold tracking-tighter">PULSE_ACTIVE</span>
                        </div>
                    </motion.div>

                    {/* Scanning Line */}
                    <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[1px] bg-[#FF7F50] shadow-[0_0_15px_#FF7F50] z-20"
                    />

                    <div className="absolute bottom-4 left-4">
                        <span className="text-[10px] font-mono text-[#FF7F50]/60">ID://LOCAL_NODE_A1</span>
                    </div>
                </div>

                {/* Right: Technical Logs & Structure */}
                <div className="flex flex-col gap-6">
                    {/* Technical Logs */}
                    <div className="flex-grow bg-[#FDFBF7] border border-[#0B123B]/10 p-6 font-mono text-[10px] overflow-hidden min-h-[200px]">
                        <div className="flex items-center justify-between border-b border-[#0B123B]/10 pb-2 mb-4">
                            <span className="text-[#0B123B]/60 uppercase font-bold">SYSTEM_DIAG_LOGS</span>
                            <span className="text-[#0B123B]/40 animate-pulse">● LIVE</span>
                        </div>
                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {logs.map((log, i) => (
                                    <motion.div
                                        key={log + i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="text-[#0B123B] flex gap-3"
                                    >
                                        <span className="text-[#0B123B]/30">[{new Date().toLocaleTimeString()}]</span>
                                        <span className="font-bold">{log}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Secondary Skeletons */}
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 bg-[#FDFBF7] border border-[#0B123B]/5 p-3 flex flex-col justify-between">
                                <div className="h-2 w-1/3 bg-[#0B123B]/5 rounded-full" />
                                <div className="h-4 w-full bg-[#0B123B]/5 rounded-sm" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
