"use client";

import { useCollab } from "@/hooks/useCollab"; 
import { Editor } from "@/components/Editor";
import { Preview } from "@/components/Preview";
import { DocsPanel } from "@/components/DocsPanel";
import { use, useState, useEffect } from "react";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    // get roomId from link
    const resolvedParams = use(params);
    const currentRoom = resolvedParams.roomId;

    // Destructure new Yjs objects
    const { code, ytext, provider } = useCollab(currentRoom);

    const [runningCode, setRunningCode] = useState<string>(code);
    const [runCount, setRunCount] = useState(0);
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
            
            <div className="flex-1 flex flex-col h-full">
                <div className="h-[70%] w-full flex flex-col">
                    <Editor 
                        roomId={currentRoom}
                        onRun={updateRunCode}
                        autoRunState={autoRun}
                        toggleAuto={toggleAuto}
                        ytext={ytext}
                        provider={provider}
                    />
                </div>
                <div className="h-[30%] w-full border-t-[4px] border-gray-200 flex flex-col">
                    <DocsPanel />
                </div>

            </div>
            
            <div className="flex-1 flex flex-col h-full">
                <Preview 
                    code={runningCode}
                    key={runCount}
                />
            </div>

        </main>
    );
}