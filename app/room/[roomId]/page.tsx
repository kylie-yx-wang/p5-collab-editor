"use client";

import { useCollab } from "@/hooks/useCollab"; 
import { Editor } from "@/components/Editor";
import { Preview } from "@/components/Preview";
import { Toolbar } from "@/components/Toolbar";
import { DocsPanel } from "@/components/DocsPanel";
import { use, useState, useEffect } from "react";
import { SaveModal, SaveData } from "@/components/SaveModal";
import { useSaveProject, useSaveVersion } from "@/hooks/useSaveProject";
import { supabase } from "@/supabase";
import { User } from "@supabase/supabase-js";
import * as Y from "yjs";

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
    

    // --- PERSISTENCE & AUTH STATE ---
    const [user, setUser] = useState<User | null>(null);
    const [projectData, setProjectData] = useState<any>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    
    const { saveProject, isSaving } = useSaveProject();
    //const { createVersion, isVersioning } = useSaveVersion();

    // 1. Listen for User Auth
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Check if this room has been saved before
    useEffect(() => {
        const fetchProjectInfo = async () => {
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('project_id', currentRoom)
                .single();
            
            if (data) setProjectData(data);
        };
        fetchProjectInfo();
    }, [currentRoom]);

    const hasSavedBefore = Boolean(projectData?.owner_id);

    // --- SAVE HANDLERS ---
    // Helper to get the binary canvas state
    const getDocState = () => {
        if (!ytext?.doc) return undefined;
        return Y.encodeStateAsUpdate(ytext.doc);
    };

    const handleSaveCurrentVersion = async (data: SaveData) => {
        if (!user) return;
        
        await saveProject({
            projectId: currentRoom,
            projectName: data.title,
            ownerId: user.id,
            yjsDocState: getDocState()
        });

        // Update local database knowledge
        setProjectData({ ...projectData, owner_id: user.id, project_name: data.title });
        setIsSaveModalOpen(false);
    };

    const handleCreateNewVersion = async (data: SaveData) => {
        if (!user) return;
        
        const docState = getDocState();

        // 1. Update the main working copy
        await saveProject({
            projectId: currentRoom,
            projectName: data.title,
            ownerId: user.id,
            yjsDocState: docState
        });

        // 2. Create the permanent history snapshot
        if (docState) {
            //await createVersion(currentRoom, docState, user.id, data.versionDescription);
        }

        // Update local database knowledge
        setProjectData({ ...projectData, owner_id: user.id, project_name: data.title });
        setIsSaveModalOpen(false);
    };

    // Placeholder for publish handler
    const handlePublish = () => {
        console.log("Publish clicked!");
    };
    

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
                    onSave={() => setIsSaveModalOpen(true)}
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

            {/* MODALS */}
            <SaveModal 
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                user={user}
                hasSavedBefore={hasSavedBefore}
                initialTitle={projectData?.project_name}
                initialDescription={projectData?.project_description}
                onSaveCurrent={handleSaveCurrentVersion}
                onCreateNewVersion={handleCreateNewVersion}
            />

        </main>
    );
}