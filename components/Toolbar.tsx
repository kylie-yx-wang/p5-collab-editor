"use client";

import React, { useState } from 'react';

interface ToolbarProps {
    roomId: string;
    onRun: () => void;
    autoRunState: boolean;
    toggleAuto: (autoOn: boolean) => void;
}

export const Toolbar = ({ roomId, onRun, autoRunState, toggleAuto }: ToolbarProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link!", err);
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 text-gray-500 p-2 font-mono flex justify-between items-center shrink-0">
            
            {/* LEFT SIDE */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">
                    Room: <span className="text-purple-600 font-bold">{roomId}</span>
                </span>
                <button 
                    onClick={handleCopyLink}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                        copied 
                        ? "bg-purple-100 text-purple-600 border border-purple-300" 
                        : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                    }`}
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold transition-colors ${autoRunState ? "text-green-500" : "text-gray-400"}`}>
                        Auto-Run
                    </span>
                    <button
                        onClick={() => toggleAuto(!autoRunState)}
                        className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors duration-200 ease-in-out ${
                            autoRunState ? "bg-green-400" : "bg-gray-300"
                        }`}
                    >
                        <div 
                            className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                                autoRunState ? "translate-x-4" : "translate-x-0"
                            }`}
                        />
                    </button>
                </div>

                <button 
                    onClick={onRun}
                    className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold px-5 py-1 rounded shadow-sm active:scale-95 active:shadow-inner transition-all flex items-center justify-center"
                >
                    Run
                </button>
            </div>
        </div>
    );
};