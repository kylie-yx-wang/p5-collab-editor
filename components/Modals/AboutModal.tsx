// components/Modals/AboutModal.tsx
"use client";

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
}

export function AboutModal({ isOpen, onClose, project }: AboutModalProps) {
    if (!isOpen) return null;

    // Fallbacks just in case the data isn't fully populated
    const title = project?.project_name || "Untitled Project";
    const author = project?.author_name || "Unknown Creator";
    const date = project?.created_at ? new Date(project.created_at).toLocaleDateString() : "Unknown Date";
    const description = project?.project_description || "No description provided.";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-mono">
            <div className="bg-white rounded border border-gray-200 shadow-xl w-full max-w-md p-6 flex flex-col">
                
                {/* Header */}
                <div className="mb-4 border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold text-purple-600">{title}</h2>
                    <p className="text-xs font-semibold text-gray-500 mt-2">
                        Created by <span className="text-gray-700 font-bold">{author}</span> on {date}
                    </p>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{description}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-2">
                    <button 
                        onClick={onClose}
                        className="bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 text-sm font-bold px-5 py-1 rounded transition-colors"
                    >
                        Close
                    </button>
                </div>
                
            </div>
        </div>
    );
}