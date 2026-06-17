"use client";

import { useCollab } from "@/hooks/useCollab"; 
import { Editor } from "@/components/Editor";
import { Preview } from "@/components/Preview";
import { Toolbar } from "@/components/Toolbar";
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

    const updateRunCode = () => {
        setRunningCode(code);
        setRunCount(prevCount => prevCount + 1);
    };

    // automatically run code
    const [autoRun, setAutoRunState] = useState(true);

    const toggleAuto = (autoOn : boolean) => {
        setAutoRunState(autoOn);
    }

    // JS documentation
    const [jsHelp, setJsHelpState] = useState(true);
    const toggleJSHelp = (helpOn: boolean) => {setJsHelpState(helpOn)};

    // p5 documentation
    const [p5Help, setP5HelpState] = useState(true);
    const toggleP5Help = (helpOn: boolean) => {setP5HelpState(helpOn)};

    // Group in objects
    const EditorToggles = {
        jsHelp: jsHelp,
        p5Help: p5Help,
    };

    const ToolbarToggleStates = {
        autoRun: autoRun,
        jsHelp: jsHelp,
        p5Help: p5Help,
    };
    const ToolbarToggles = {
        setAutoRun: toggleAuto,
        setJsHelp: toggleJSHelp,
        setP5Help: toggleP5Help
    }
    

    // run preview when code changed
    useEffect(() => {
        if (autoRun) {
            setRunningCode(code);
            setRunCount(prevCount => prevCount + 1);
        }
    }, [code, autoRun]);

    return (
        <main className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
            
            {/* TOOLBAR */}
            <div className="h-12 w-full bg-white border-b-1 border-gray-300 flex flex-col">
                <Toolbar 
                    roomId={currentRoom} 
                    onRun={updateRunCode}
                    ToolbarToggleStates={ToolbarToggleStates}
                    ToolbarToggles={ToolbarToggles}
                />
            </div>

            {/* WORKSPACE */}
            <div className="flex-1 flex w-full overflow-hidden">
                
                {/* LEFT HALF */}
                <div className="w-1/2 flex flex-col h-full border-r-1 border-gray-300 bg-white">
                    
                    <div className="h-[70%] w-full flex flex-col">
                        <Editor 
                            roomId={currentRoom}
                            onRun={updateRunCode}
                            toggles={EditorToggles}
                            ytext={ytext}
                            provider={provider}
                        />
                    </div>

                    <div className="h-[30%] w-full border-t-1 border-gray-300 flex flex-col">
                        <DocsPanel />
                    </div>

                </div>

                {/* RIGHT HALF */}
                <div className="w-1/2 h-full flex flex-col bg-white">
                    <Preview 
                        code={runningCode}
                        key={runCount}
                    />
                </div>
            </div>

        </main>
    );
}