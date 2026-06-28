"use client";

import React, { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";

interface StagingModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "create" | "join";
    roomId: string;
    requiresPassword?: boolean; // Only true if joining a protected room
    user: User | null;
    onSubmit: (data: { nickname: string; password?: string }) => Promise<void>;
}

export const StagingModal = ({
    isOpen,
    onClose,
    mode,
    roomId,
    requiresPassword = false,
    user,
    onSubmit
}: StagingModalProps) => {
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Autopopulate the nickname when the modal opens
    useEffect(() => {
        if (isOpen) {
            if (user?.email) {
                // If signed in, use the first half of their email
                setNickname(user.email.split("@")[0]);
            } else {
                // If a guest, check if they already set a name earlier in this session
                const cachedGuest = sessionStorage.getItem("guest_identity");
                if (cachedGuest) {
                    setNickname(cachedGuest);
                }
            }
            // Reset fields
            setPassword("");
            setErrorMsg("");
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        const finalNickname = nickname.trim() || `Guest ${Math.floor(Math.random() * 100)}`;

        // Lock the identity into sessionStorage before entering
        sessionStorage.setItem("guest_identity", finalNickname);

        // Grant TICKET access to this room
        sessionStorage.setItem(`room_access_${roomId}`, "true");

        try {
            // The parent component handles the DB save and routing
            await onSubmit({ nickname: finalNickname, password });
        } catch (err: any) {
            setErrorMsg(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            {mode === "create" ? "Create Room" : "Join Lobby"}
                        </h2>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">Room: {roomId}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Display Name</label>
                        <input 
                            type="text" 
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="e.g., Kylie"
                            className="w-full border border-gray-200 p-2 rounded focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                        />
                    </div>

                    {(mode === "create" || requiresPassword) && (
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">
                                {mode === "create" ? "Room Password (Optional)" : "Room Password Required"}
                            </label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={mode === "create" ? "Leave blank for public access" : "Enter password"}
                                required={requiresPassword}
                                className="w-full border border-gray-200 p-2 rounded focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                            />
                        </div>
                    )}

                    {errorMsg && (
                        <div className="p-2 bg-red-50 text-red-600 text-xs font-bold rounded text-center">
                            {errorMsg}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded shadow-sm transition disabled:opacity-50"
                    >
                        {isLoading ? "Connecting..." : "Enter Room"}
                    </button>
                </form>
            </div>
        </div>
    );
};