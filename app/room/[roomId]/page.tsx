"use client";

import { useCollab } from "@/hooks/useCollab"; // Import our new hook
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
            code={code}
        />

        </main>
    );
}