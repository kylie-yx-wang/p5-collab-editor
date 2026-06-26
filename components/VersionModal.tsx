"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";

interface VersionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

interface ProjectVersion {
    version_id: string;
    version_description: string;
    created_at: string;
    // We will use the array index for the version number to keep things simple
}

export const VersionsModal = ({ isOpen, onClose, projectId }: VersionsModalProps) => {
    const [versions, setVersions] = useState<ProjectVersion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVersions = async () => {
            if (!isOpen) return;
            
            setIsLoading(true);
            
            // Fetch versions ordered by newest first
            const { data, error } = await supabase
                .from("project_versions")
                .select("version_id, version_description, created_at")
                .eq("project_id", projectId)
                .order("created_at", { ascending: false });

            if (!error && data) {
                setVersions(data);
            }
            setIsLoading(false);
        };

        fetchVersions();
    }, [isOpen, projectId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Version History</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1 text-xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-0 overflow-y-auto flex-1 bg-gray-50">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500 animate-pulse">
                            Loading history...
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center">
                            <span className="text-4xl mb-3">📭</span>
                            <p className="text-gray-500 font-medium">No versions saved yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Save your project to see its history here.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {versions.map((version, index) => {
                                // Since array is newest-first, math gives us chronological version numbers
                                const versionNumber = versions.length - index; 
                                const date = new Date(version.created_at).toLocaleString(undefined, {
                                    dateStyle: "medium",
                                    timeStyle: "short"
                                });

                                return (
                                    <li key={version.version_id} className="p-4 bg-white hover:bg-gray-50 transition flex justify-between items-center group">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                                    V{versionNumber}
                                                </span>
                                                <span className="text-sm font-bold text-gray-800">
                                                    {version.version_description || "Saved version"}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400">{date}</span>
                                        </div>
                                        
                                        {/* Placeholder for future restore functionality */}
                                        <button className="opacity-0 group-hover:opacity-100 transition text-sm font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded">
                                            Restore
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};