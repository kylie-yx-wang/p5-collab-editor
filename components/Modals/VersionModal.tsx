"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import * as Y from "yjs";
import { fromHex } from '@/lib/utils';


interface VersionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onRevert: (revertedText: string) => void; 
    onDelete: (versionId: string) => Promise<{ success: boolean; error?: string }>;
}

interface ProjectVersion {
    version_id: string;
    version_description: string;
    created_at: string;
}

export const VersionsModal = ({ isOpen, onClose, projectId, onRevert, onDelete }: VersionsModalProps) => {
    const [versions, setVersions] = useState<ProjectVersion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Preview States
    const [previewVersion, setPreviewVersion] = useState<ProjectVersion | null>(null);
    const [previewText, setPreviewText] = useState<string>("");
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    // Delete States
    const [versionToDelete, setVersionToDelete] = useState<ProjectVersion | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch the list of versions
    const fetchVersions = async () => {
        if (!isOpen) return;
        
        setIsLoading(true);
        setPreviewVersion(null); 
        setVersionToDelete(null);
        
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

    useEffect(() => {
        fetchVersions();
    }, [isOpen, projectId]);

    // Build the specific version's text for preview
    const handlePreviewClick = async (version: ProjectVersion) => {
        setPreviewVersion(version);
        setIsPreviewLoading(true);

        try {
            const { data: history, error } = await supabase
                .from("project_versions")
                .select("yjs_state")
                .eq("project_id", projectId)
                .lte("created_at", version.created_at) 
                .order("created_at", { ascending: true });

            if (error) throw error;

            const tempDoc = new Y.Doc();
            if (history) {
                history.forEach(row => {
                    if (row.yjs_state) {
                        const updateMap = fromHex(row.yjs_state);
                        Y.applyUpdate(tempDoc, updateMap);
                    }
                });
            }

            const extractedText = tempDoc.getText('codemirror').toString();
            setPreviewText(extractedText);

        } catch (error) {
            console.error("❌ Error loading version preview:", error);
            setPreviewText("Failed to load version content.");
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleConfirmRevert = () => {
        onRevert(previewText);
        setPreviewVersion(null);
        onClose();
    };

    // Execute Delete
    const handleConfirmDelete = async () => {
        if (!versionToDelete) return;
        
        setIsDeleting(true);
        const result = await onDelete(versionToDelete.version_id);
        
        if (result.success) {
            // Re-fetch versions to ensure chronological numbers are accurate
            await fetchVersions();
        } else {
            alert(`Failed to delete version: ${result.error}`);
        }
        
        setIsDeleting(false);
        setVersionToDelete(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] relative">
                
                {/* --- DELETE CONFIRMATION OVERLAY --- */}
                {versionToDelete && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur flex flex-col items-center justify-center p-6 text-center">
                        <div className="bg-red-50 text-red-600 rounded-full w-16 h-16 flex items-center justify-center mb-4 text-3xl">
                            🗑️
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete this version?</h3>
                        <p className="text-gray-500 mb-6 max-w-sm">
                            Are you sure you want to delete <span className="font-semibold text-gray-800">"{versionToDelete.version_description}"</span>? This will permanently remove it from history and squash its changes into the next version.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setVersionToDelete(null)}
                                disabled={isDeleting}
                                className="px-5 py-2.5 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-5 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete Version"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                        {previewVersion && (
                            <button 
                                onClick={() => setPreviewVersion(null)}
                                className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition"
                            >
                                ← Back
                            </button>
                        )}
                        <h2 className="text-lg font-bold text-gray-800">
                            {previewVersion ? `Preview: ${previewVersion.version_description}` : "Version History"}
                        </h2>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1 text-xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-0 overflow-y-auto flex-1 bg-gray-50 flex flex-col">
                    
                    {/* PREVIEW VIEW */}
                    {previewVersion ? (
                        <div className="flex flex-col h-full">
                            {isPreviewLoading ? (
                                <div className="flex-1 flex items-center justify-center text-gray-500 animate-pulse p-8">
                                    Constructing time machine...
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 p-4 overflow-y-auto">
                                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap break-words">
                                            {previewText || "// This version is empty."}
                                        </pre>
                                    </div>
                                    <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                                        <button 
                                            onClick={() => setPreviewVersion(null)}
                                            className="px-4 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleConfirmRevert}
                                            className="px-4 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
                                        >
                                            Revert to this Version
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                    /* LIST VIEW */
                    ) : isLoading ? (
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
                                        
                                        {/* Action Buttons */}
                                        <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2">
                                            <button 
                                                onClick={() => setVersionToDelete(version)}
                                                className="text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition"
                                            >
                                                Delete
                                            </button>
                                            <button 
                                                onClick={() => handlePreviewClick(version)}
                                                className="text-sm font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded transition"
                                            >
                                                Restore
                                            </button>
                                        </div>
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