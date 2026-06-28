"use client";

import React, { useState, useEffect } from "react";
import { AuthPanel } from "./AuthPanel";

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any; 
    project: any; // Requires project_id, owner_id, project_name, description
    onPublish: (data: { title: string; description: string; authorName: string }) => Promise<void>;
}

export const PublishModal = ({
    isOpen,
    onClose,
    user,
    project,
    onPublish
}: PublishModalProps) => {
    // Modal steps: "auth" -> "form" -> "success"
    const [step, setStep] = useState<"auth" | "form" | "success">("auth");
    
    // Form States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);

    // Evaluate permissions
    const hasOwner = !!project?.owner_id;
    const isOwner = user?.id === project?.owner_id;
    const canPublish = !hasOwner || isOwner;

useEffect(() => {
        if (isOpen) {
            // Pre-fill existing data
            setTitle(project?.project_name || "Untitled Project");
            setDescription(project?.project_description || ""); 
            setAuthorName(user?.user_metadata?.name || user?.user_metadata?.full_name || "");

            setStep("auth");
        }
    }, [isOpen, user, project]);

    const handlePublishClick = async () => {
        setIsPublishing(true);
        try {
            await onPublish({ title, description, authorName });
            setStep("success");
        } catch (error) {
            console.error(error);
            alert("Failed to publish. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleClose = () => {
        if (step === "success") {
            // Hard refresh if they are closing after a successful publish
            window.location.reload();
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    // Generate the share link
    const shareLink = typeof window !== "undefined" ? `${window.location.origin}/room/${project?.project_id}` : "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">
                        {step === "success" ? "Published!" : "Post Project to Public Gallery"}
                    </h2>
                    <button 
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    
                    {/* Security Block: Someone else owns this */}
                    {!canPublish && (
                         <div className="flex flex-col items-center justify-center text-center py-8">
                            <span className="text-4xl mb-4">🔒</span>
                            <h3 className="font-bold text-gray-800 mb-2">Permission Denied</h3>
                            <p className="text-sm text-gray-500">
                                This canvas is owned by another user. Only the project owner can publish this to the gallery.
                            </p>
                        </div>
                    )}

                    {/* Step 1: Auth */}
                    {canPublish && step === "auth" && (
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-xs text-gray-500 mb-6 text-center bg-blue-50 p-3 rounded">
                                Publishing your project makes it searchable on P5.js Playground’s public gallery. You can share your project with friends and family without publishing by sharing the project link and password (if you added one).
                            </p>
                            
                            {user ? (
                                <div className="w-full flex flex-col items-center gap-4 mt-2">
                                    <button 
                                        onClick={() => setStep("form")}
                                        className="bg-[#119f98] hover:bg-[#0e8a83] text-white font-bold py-3 px-8 rounded shadow-sm transition w-full"
                                    >
                                        Continue as {user.email?.split('@')[0]}
                                    </button>
                                    
                                    <div className="flex flex-col items-center border-t border-gray-100 w-full pt-4">
                                        <button 
                                            onClick={() => {
                                                setAuthorName(""); // Clear their name
                                                setStep("form");
                                            }}
                                            className="text-xs text-gray-500 hover:text-[#119f98] underline transition text-center"
                                        >
                                            or publish anonymously
                                        </button>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            (Your username will not be attached to this project in the gallery)
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <AuthPanel />
                                    <div className="mt-6 flex flex-col items-center border-t border-gray-100 w-full pt-4">
                                        <button 
                                            onClick={() => setStep("form")}
                                            className="text-xs text-gray-500 hover:text-[#119f98] underline transition text-center"
                                        >
                                            or publish anonymously as a guest
                                        </button>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            (you will not be able to edit the project after it is published)
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 2: Form */}
                    {canPublish && step === "form" && (
                        <div className="flex flex-col gap-4">
                            <p className="text-xs text-gray-500 mb-2 bg-blue-50 p-3 rounded">
                                Publishing your project makes it searchable on P5.js Playground’s public gallery. You can share your project with friends and family without publishing by sharing the project link and password (if you added one).
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Project Title</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-gray-200 p-2 rounded focus:outline-none focus:border-[#119f98] focus:ring-1 focus:ring-[#119f98] transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Created By (Author Name)</label>
                                <input 
                                    type="text" 
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder="Anonymous"
                                    className="w-full border border-gray-200 p-2 rounded focus:outline-none focus:border-[#119f98] transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-200 p-2 rounded focus:outline-none focus:border-[#119f98] transition resize-none text-sm"
                                    placeholder="Tell the community what your project is about..."
                                />
                            </div>

                            {user && (
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-70">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Collaborators</label>
                                    <p className="text-[10px] text-gray-500 mb-2 leading-tight">
                                        Collaborators will be credited on the public gallery page.
                                    </p>
                                    <input 
                                        type="text" 
                                        disabled
                                        placeholder="Coming soon..."
                                        className="w-full border border-gray-200 p-2 rounded text-sm bg-gray-100 cursor-not-allowed"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {canPublish && step === "success" && (
                         <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="text-5xl mb-4">🎉</div>
                            <h3 className="font-bold text-[#119f98] text-xl mb-2">Congrats, it’s published!</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Your project is now live on the public gallery. Anyone can view and play with your code.
                            </p>

                            <div className="w-full bg-gray-50 p-3 rounded border border-gray-200 flex items-center gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={shareLink} 
                                    className="w-full bg-transparent text-xs text-gray-600 outline-none"
                                />
                                <button 
                                    onClick={() => navigator.clipboard.writeText(shareLink)}
                                    className="shrink-0 bg-white border border-gray-300 text-xs py-1 px-3 rounded hover:bg-gray-100 transition"
                                >
                                    Copy Link
                                </button>
                            </div>
                         </div>
                    )}

                </div>

                {/* Footer / Actions */}
                {canPublish && step === "form" && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2 justify-between items-center">
                        <button 
                            onClick={() => {
                                // Reset the author name back to their username if they go back
                                setAuthorName(user?.user_metadata?.name || user?.user_metadata?.full_name || "");
                                setStep("auth");
                            }}
                            className="text-gray-500 hover:text-gray-700 text-sm font-bold px-2"
                        >
                            ← Back
                        </button>
                        
                        <button 
                            onClick={handlePublishClick}
                            disabled={isPublishing || !title.trim()}
                            className="bg-[#119f98] hover:bg-[#0e8a83] text-white font-bold py-2 px-6 rounded shadow-sm transition disabled:opacity-50"
                        >
                            {isPublishing ? "Publishing..." : "Publish to Gallery"}
                        </button>
                    </div>
                )}
                
                {canPublish && step === "success" && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                        <button 
                            onClick={handleClose}
                            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-8 rounded shadow-sm transition w-full"
                        >
                            Back to Project
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};