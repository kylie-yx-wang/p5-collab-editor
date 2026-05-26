"use client";

import { useCollab } from "@/hooks/useCollab"; // Import our new hook
import { generateP5Html } from "@/lib/p5-template";
import { Editor } from "@/components/Editor";
import { Preview } from "@/components/Preview";
import { use } from "react";
export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    // get roomId from link
    const resolvedParams = use(params);
    const currentRoom = resolvedParams.roomId;

    // We call our hook on the room Id
    const { code, handleUpdate } = useCollab(currentRoom);

    return (
        <main className="flex h-screen w-screen overflow-hidden bg-gray-900">
        {/* Editor Side */}
        {/* We pass the shared state down into the editor as "Props" */}
        <Editor 
            code={code} 
            onUpdate={handleUpdate} 
            roomId={currentRoom}
        />


        {/* Preview Side */}
        <Preview 
        <div className="flex-1 flex flex-col bg-white">
            <div className="bg-gray-200 text-gray-700 p-2 text-sm font-sans font-bold">Preview</div>
            <iframe
            srcDoc={generateP5Html(code)}
            className="flex-1 border-none"
            title="p5-preview"
            sandbox="allow-scripts"
            />
        </div>
        </main>
    );
}