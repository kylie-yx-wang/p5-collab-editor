"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase";

// ==========================================
// Hook: Add Collaborator
// ==========================================
export function useAddCollaborator() {
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const addCollaborator = async (projectId: string, email: string) => {
        setIsAdding(true);
        setError(null);
        setSuccess(false);

        try {
            // Find the user's UUID by email.
            const { data: userProfile, error: userError } = await supabase
                .rpc('get_user_id_by_email', { lookup_email: email });

            if (userError || !userProfile) {
                throw new Error("User not found. Make sure they have registered an account.");
            }

            // Fallback: RPCs returning a single UUID often return it as a string, not an object.
            const newUserId = userProfile.id || userProfile; 

            // Fetch the current project to get the existing collaborators array
            const { data: project, error: projectError } = await supabase
                .from("projects")
                .select("collaborators, owner_id")
                .eq("project_id", projectId)
                .single();

            if (projectError || !project) {
                throw new Error("Project not found.");
            }

            // TASK 3: Error if trying to add yourself (Already handled beautifully here!)
            if (project.owner_id === newUserId) {
                throw new Error("This user is already the owner of the project.");
            }

            const currentCollaborators = project.collaborators || [];

            // TASK 2: Error if already a collaborator (Already handled beautifully here!)
            if (currentCollaborators.includes(newUserId)) {
                throw new Error("User is already a collaborator.");
            }

            // Append the new UUID and update the array
            const updatedCollaborators = [...currentCollaborators, newUserId];

            const { error: updateError } = await supabase
                .from("projects")
                .update({ collaborators: updatedCollaborators })
                .eq("project_id", projectId);

            if (updateError) throw updateError;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsAdding(false);
        }
    };

    return { addCollaborator, isAdding, error, success, setError, setSuccess };
}

// ==========================================
// COMPONENT: CollaboratorModal
// ==========================================
interface CollaboratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

export function CollaboratorModal({ isOpen, onClose, projectId }: CollaboratorModalProps) {
    const [email, setEmail] = useState("");
    const { addCollaborator, isAdding, error, success, setError, setSuccess } = useAddCollaborator();
    
    // State for the existing collaborators list
    const [existingCollabs, setExistingCollabs] = useState<{ id: string; email: string }[]>([]);
    const [isLoadingCollabs, setIsLoadingCollabs] = useState(false);

    // Fetch existing collaborators when the modal opens or when a new one is successfully added
    useEffect(() => {
        if (!isOpen) return;

        const fetchExistingCollaborators = async () => {
            setIsLoadingCollabs(true);
            try {
                // 1. Get the array of UUIDs from the project
                const { data: projectData } = await supabase
                    .from("projects")
                    .select("collaborators")
                    .eq("project_id", projectId)
                    .single();

                const collabs = projectData?.collaborators || [];

                if (collabs.length > 0) {
                    // 2. Resolve UUIDs to emails using our new secure RPC function
                    const { data: profiles, error: rpcError } = await supabase
                        .rpc("get_emails_by_user_ids", { user_ids: collabs });

                    if (rpcError) {
                        console.error("Error fetching collaborator emails:", rpcError);
                        setExistingCollabs([]);
                    } else if (profiles) {
                        setExistingCollabs(profiles);
                    }
                } else {
                    setExistingCollabs([]);
                }
            } catch (err) {
                console.error("Failed to load existing collaborators", err);
            } finally {
                setIsLoadingCollabs(false);
            }
        };

        fetchExistingCollaborators();
    }, [isOpen, projectId, success]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) return;

        // Optional UI quick-check before hitting the database (Task 2 & 3 reinforcement)
        if (existingCollabs.some(collab => collab.email === trimmedEmail)) {
            setError("User is already a collaborator.");
            setSuccess(false);
            return;
        }

        await addCollaborator(projectId, trimmedEmail);
    };

    const handleClose = () => {
        setEmail("");
        setError(null);
        setSuccess(false);
        setExistingCollabs([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-mono p-4">
            <div className="bg-white rounded border border-gray-200 shadow-xl w-full max-w-md p-6 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="mb-4 border-b border-gray-200 pb-4 shrink-0">
                    <h2 className="text-xl font-bold text-purple-600">Manage Collaborators</h2>
                    <p className="text-xs font-semibold text-gray-500 mt-2">
                        Invite someone to edit this project with you.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6 shrink-0">
                    <div>
                        <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Collaborator Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            placeholder="friend@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError(null);
                                setSuccess(false);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            disabled={isAdding}
                        />
                    </div>

                    {/* Status Messages */}
                    {error && (
                        <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-2 bg-green-50 border border-green-200 text-green-600 text-xs rounded font-bold">
                            Collaborator successfully added!
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isAdding || !email.trim()}
                        className={`mt-2 py-2 rounded text-sm font-bold shadow-sm transition-all flex justify-center items-center ${
                            isAdding || !email.trim()
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-purple-500 hover:bg-purple-600 text-white active:scale-95 active:shadow-inner"
                        }`}
                    >
                        {isAdding ? "Adding..." : "Add Collaborator"}
                    </button>
                </form>

                {/* TASK 1: SCROLLING LIST OF EXISTING COLLABORATORS */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-[120px]">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 shrink-0">
                        Existing Collaborators
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto border border-gray-200 rounded bg-gray-50 p-2">
                        {isLoadingCollabs ? (
                            <p className="text-xs text-gray-400 text-center py-4">Loading...</p>
                        ) : existingCollabs.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">No collaborators yet.</p>
                        ) : (
                            <ul className="flex flex-col gap-1">
                                {existingCollabs.map((collab) => (
                                    <li 
                                        key={collab.id} 
                                        className="text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded flex items-center justify-between"
                                    >
                                        <span className="truncate">{collab.email}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-4 shrink-0 pt-4 border-t border-gray-200">
                    <button 
                        onClick={handleClose}
                        className="bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 text-sm font-bold px-5 py-1 rounded transition-colors"
                    >
                        {success ? "Done" : "Close"}
                    </button>
                </div>
                
            </div>
        </div>
    );
}