"use client";

import React, { useState, useEffect } from "react";

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPassword?: string | null;
    onSave: (newPassword: string | null) => Promise<void>;
}

export const PasswordModal = ({
    isOpen,
    onClose,
    currentPassword,
    onSave
}: PasswordModalProps) => {
    const [password, setPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Autopopulate with existing password, or empty string if null
            setPassword(currentPassword || "");
        }
    }, [isOpen, currentPassword]);

    const handleSaveClick = async () => {
        setIsSaving(true);
        try {
            // If they cleared the field, pass null to the database to remove the password
            const cleanPassword = password.trim();
            await onSave(cleanPassword === "" ? null : cleanPassword);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save password.");
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
                    <h2 className="text-lg font-bold text-gray-800">Room Password</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6">
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                        Edit Password
                    </label>
                    <input 
                        type="text" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank for no password"
                        className="w-full border border-gray-200 p-2 rounded focus:outline-none focus:border-[#119f98] focus:ring-1 focus:ring-[#119f98] transition"
                    />
                    <p className="text-[10px] text-gray-400 mt-2">
                        Anyone with the room link and this password can join and edit the canvas.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={handleSaveClick}
                        disabled={isSaving}
                        className="bg-[#119f98] hover:bg-[#0e8a83] text-white font-bold py-2 px-6 rounded shadow-sm transition disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Password"}
                    </button>
                </div>
            </div>
        </div>
    );
};