"use client";

import React, { useState } from 'react';

interface ToolbarProps {
    roomId: string;
}

export const Toolbar = ({ roomId }: ToolbarProps) => {
    // State to track if the link was just copied
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            // window.location.href grabs the exact current URL
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            
            // Reset the button UI back to normal after 2 seconds
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy link!", err);
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 text-gray-500 p-2 text-sm font-mono flex justify-between items-center shrink-0">
            <span className="font-bold text-pink-500">editor.js</span>
            
            {/* Grouped the text and the button together using flex and gap */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500">
                    Room Code: <span className="text-purple-600">{roomId}</span>
                </span>
                
                <button 
                    onClick={handleCopyLink}
                    // Dynamic Tailwind styling based on the 'copied' state
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        copied 
                        ? "bg-purple-100 text-purple-600 border border-purple-300" 
                        : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                    }`}
                >
                    {copied ? "Copied!" : "Copy Link"}
                </button>
            </div>
        </div>
    );
};