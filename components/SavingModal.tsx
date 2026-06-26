"use client";

import React, { useState, useEffect } from "react";
import { AuthPanel } from "./AuthPanel";

interface SaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any; // Pass the Supabase user object, or null if logged out
    hasSavedBefore: boolean; // Tells us which buttons to show
    initialTitle?: string;
    initialDescription?: string;
    initialVersionDescription?: string;
    onSaveCurrent: (data: SaveData) => void;
    onCreateNewVersion: (data: SaveData) => void;
}

export interface SaveData {
    title: string;
    description: string;
    versionDescription: string;
}

export const SaveModal = ({
    isOpen,
    onClose,
    user,
    hasSavedBefore,
    initialTitle = "Untitled Project",
    initialDescription = "",
    initialVersionDescription = "",
    onSaveCurrent,
    onCreateNewVersion
}: SaveModalProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [versionDescription, setVersionDescription] = useState("");

    useEffect(() => {
        if (isOpen) {
            // Force the states to update with whatever the latest props are
            setTitle(initialTitle || "Untitled Project");
            setDescription(initialDescription || "");
            
            if (!hasSavedBefore) {
                setVersionDescription("Created project");
            } else {
                setVersionDescription(""); // Leave blank to prompt a new description
            }
        }
    }, [isOpen, initialTitle, initialDescription, hasSavedBefore]);

    const handleOverwrite = () => {
        onSaveCurrent({
            title,
            description,
            // If they typed nothing, use the old version description. 
            // If there's no old one, fallback to a default string.
            versionDescription: versionDescription.trim() || initialVersionDescription || "Updated project"
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">
                        {!user ? "Sign in to Save" : "Save to My Projects"}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    {!user ? (
                        /* NOT LOGGED IN: Show Auth Panel */
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-sm text-gray-500 mb-6 text-center">
                                You need an account to permanently save your canvas and manage versions.
                            </p>
                            <AuthPanel />
                        </div>
                    ) : (
                        /* LOGGED IN: Show Save Form */
                        <div className="flex flex-col gap-4">
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Project Title</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-gray-200 p-2 rounded focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Project Description</label>
                                <textarea 
                                    value={description || ""}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    className="w-full border border-gray-200 p-2 rounded focus:outline-none focus:border-purple-500 transition resize-none text-sm"
                                    placeholder="What is this project about?"
                                />
                            </div>

                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-70">
                                <label className="block text-xs font-bold text-gray-600 mb-1">Add Collaborators</label>
                                <p className="text-[10px] text-gray-500 mb-2 leading-tight">
                                    Collaborators can see and edit this project on their own Projects page.
                                </p>
                                <input 
                                    type="text" 
                                    disabled
                                    placeholder="Coming soon..."
                                    className="w-full border border-gray-200 p-2 rounded text-sm bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Version Description</label>
                                <input 
                                    type="text" 
                                    value={versionDescription}
                                    onChange={(e) => setVersionDescription(e.target.value)}
                                    placeholder= {"e.g., Added bouncing physics"}
                                    className="w-full border border-gray-200 p-2 rounded focus:outline-none focus:border-purple-500 transition text-sm"
                                />
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer / Actions (Only show if logged in) */}
                {user && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2 justify-end">
                        {!hasSavedBefore ? (
                            <button 
                                onClick={() => onCreateNewVersion({ title, description, versionDescription })}
                                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded shadow-sm transition w-full sm:w-auto"
                            >
                                Save Project
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={handleOverwrite}
                                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded transition text-sm"
                                >
                                    Overwrite Current
                                </button>
                                <button 
                                    onClick={() => onCreateNewVersion({ 
                                        title, 
                                        description, 
                                        versionDescription: versionDescription.trim() || "New version" })}
                                    className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded shadow-sm transition text-sm"
                                >
                                    Create New Version
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};