"use client";

import { useCollab } from "@/hooks/useCollab"; // Import our new hook
import { Editor } from "@/components/Editor";
import { Preview } from "@/components/Preview";
import { use , useState , useEffect } from "react";
export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    // get roomId from link
    const resolvedParams = use(params);
    const currentRoom = resolvedParams.roomId;

    // We call our hook on the room Id
    const { code, handleUpdate } = useCollab(currentRoom);

    // preview keeps it code separately
    const [runningCode, setRunningCode] = useState<string>(code);
    // forces it to recreate object, like a key
    const [runCount, setRunCount] = useState(0);
    // whether code runs automatically
    const [autoRun, setAutoRunState] = useState(true);
    const updateRunCode = () => {
        setRunningCode(code);
        setRunCount(prevCount => prevCount + 1);
    };
    useEffect(() => {
        if (autoRun) {
            setRunningCode(code);
            setRunCount(prevCount => prevCount + 1);
        }
    }, [code, autoRun]);
    const toggleAuto = (autoOn : boolean) => {
        setAutoRunState(autoOn);
    }


    return (
        <main className="flex h-screen w-screen overflow-hidden bg-gray-900">
        {/* Editor Side */}
        {/* We pass the shared state down into the editor as "Props" */}
        <Editor 
            code={code} 
            onUpdate={handleUpdate} 
            roomId={currentRoom}
            onRun={updateRunCode}
            autoRunState={autoRun}
            toggleAuto={toggleAuto}
        />

        
        {/* Preview Side */}
        <Preview 
            code={runningCode}
            key={runCount}
        />

        </main>
    );
}