"use client";

import React, { useState, useEffect } from "react";

interface AccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPassword?: string | null;
    currentIsLocked?: boolean; // <-- Added this prop
    onSave: (newPassword: string | null, isLocked: boolean) => Promise<void>; // <-- Updated signature
}

export const PasswordModal = ({
    isOpen,
    onClose,
    currentPassword,
    currentIsLocked = false,
    onSave
}: AccessModalProps) => {
    const [password, setPassword] = useState("");
    const [isLocked, setIsLocked] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Autopopulate with existing values
            setPassword(currentPassword || "");
            setIsLocked(currentIsLocked);
        }
    }, [isOpen, currentPassword, currentIsLocked]);

    const handleSaveClick = async () => {
        setIsSaving(true);
        try {
            // If they cleared the field, pass null to the database to remove the password
            const cleanPassword = password.trim();
            await onSave(cleanPassword === "" ? null : cleanPassword, isLocked);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save access settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Room Access Settings</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 flex flex-col gap-6">
                    
                    {/* Password Section */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                            Room Password
                        </label>
                        <input 
                            type="text" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave blank for no password"
                            className="w-full border border-gray-200 p-2 rounded text-sm focus:outline-none focus:border-[#119f98] focus:ring-1 focus:ring-[#119f98] transition"
                            disabled={isSaving}
                        />
                        <p className="text-[10px] text-gray-400 mt-2 leading-tight">
                            Anyone with the room link and this password can join and edit the live canvas.
                        </p>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Lock Section */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            {/* Simple CSS Toggle Switch */}
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only"
                                    checked={isLocked}
                                    onChange={(e) => setIsLocked(e.target.checked)}
                                    disabled={isSaving}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${isLocked ? 'bg-[#119f98]' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isLocked ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="text-sm font-bold text-gray-700">Lock Project</span>
                        </label>
                        <p className="text-[10px] text-gray-400 mt-2 leading-tight">
                            When locked, visitors with the link cannot edit the main canvas. They will be given a local copy to experiment with instead.
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={handleSaveClick}
                        disabled={isSaving}
                        className="bg-[#119f98] hover:bg-[#0e8a83] text-white font-bold py-2 px-6 rounded shadow-sm transition disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>
        </div>
    );
};