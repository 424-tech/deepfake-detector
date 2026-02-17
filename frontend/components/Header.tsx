"use client";

import { useState } from "react";
import { Menu, X, Activity } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ skipRD = false }: { skipRD?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navItems = [
        { name: "Detector", href: "/" },
        { name: "API Docs", href: "/api/v1/docs" },
    ];

    return (
        <header className="fixed top-0 z-50 w-full bg-[#FDFBF7]/80 backdrop-blur-sm border-b border-[#0B123B]/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 md:h-16">

                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-[#0B123B] flex items-center justify-center text-[#FDFBF7]">
                            <Activity className="w-4 h-4 md:w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-display text-base md:text-lg tracking-tighter text-[#0B123B]">
                                DEEPFAKE CHECK
                            </span>
                            <span className="text-[9px] md:text-[10px] font-mono tracking-[0.2em] text-[#0B123B]/60 leading-none">
                                V1.0.4.B
                            </span>
                        </div>
                    </Link>

                    {/* Desktop System Status & Nav */}
                    <div className="hidden md:flex items-center gap-12">
                        {/* System Status Indicator */}
                        <div className="flex items-center gap-2 border-r border-[#0B123B]/10 pr-12">
                            <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${skipRD ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${skipRD ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                            </span>
                            <span className="text-mono-technical text-[#0B123B]">
                                {skipRD ? 'DEMO MODE' : 'SYSTEM: ONLINE'}
                            </span>
                        </div>

                        <nav className="flex items-center gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm font-medium text-[#0B123B]/70 hover:text-[#FF7F50] transition-colors uppercase tracking-wide"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Mobile Menu Button + Status Dot (Always visible on mobile) */}
                    <div className="flex items-center gap-4 md:hidden">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-[8px] font-mono font-bold text-emerald-600 tracking-tighter uppercase">ONLINE</span>
                        </div>
                        <button
                            onClick={toggleMenu}
                            className="p-1.5 text-[#0B123B] hover:bg-[#0B123B] hover:text-[#FDFBF7] transition-colors"
                        >
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#FDFBF7] border-b border-[#0B123B]/10"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-3 py-4 text-base font-bold text-[#0B123B] hover:bg-[#0B123B]/5 uppercase tracking-wide border-l-2 border-transparent hover:border-[#FF7F50]"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
