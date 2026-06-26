"use client";

import { useCollab } from "@/hooks/useCollab"; 
import { Editor } from "@/components/Editor";
import { Preview } from "@/components/Preview";
import { Toolbar } from "@/components/Toolbar";
import { DocsPanel } from "@/components/DocsPanel";
import { use, useState, useEffect } from "react";
import { SaveModal, SaveData } from "@/components/SavingModal";
import { VersionsModal } from "@/components/VersionModal";
import { useRouter } from "next/navigation";
import { useSaveProject, useSaveVersion } from "@/hooks/useSaveProject";
import { supabase } from "@/supabase";
import { User } from "@supabase/supabase-js";
import * as Y from "yjs";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    // get roomId from link
    const resolvedParams = use(params);
    const currentRoom = resolvedParams.roomId;

    // undefined = auth "loading"
    const [user, setUser] = useState<User | null | undefined>(undefined);

    // redirect state
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);
    
    // nickname state
    const [nickname, setNickname] = useState<string>("Loading...");

    const router = useRouter();

    // Resolve the user's nickname once we know their auth status
    useEffect(() => {
        if (user === undefined) return; // Still loading auth

        if (user?.email) {
            // Signed in
            setNickname(user.email.split("@")[0]);
        } else {
            // Guest: Grab the name we saved in StagingModal
            const cachedGuest = sessionStorage.getItem("guest_identity");
            setNickname(cachedGuest || `Guest ${Math.floor(Math.random() * 1000)}`);
        }
    }, [user]);

    useEffect(() => {
        const enforceSecurity = async () => {
            // Fetch the room's security requirements
            const { data: project } = await supabase
                .from('projects')
                .select('owner_id, collaborators, room_password')
                .eq('project_id', currentRoom)
                .maybeSingle();

            if (!project) { // Room doesn't exist, let your existing logic handle it
                router.replace(`/?join=${currentRoom}`);
                return;
            } 

            // Check all possible ways they are allowed in
            const isOwner = user && project.owner_id === user.id;
            const isCollaborator = user && project.collaborators?.includes(user.id);
            const hasNoPassword = !project.room_password;
            const hasSessionTicket = sessionStorage.getItem(`room_access_${currentRoom}`) === "true";

            // If they fail ALL checks, kick them to the homepage lobby
            if (!isOwner && !isCollaborator && !(hasNoPassword && user) && !hasSessionTicket) {
                console.warn("Unauthorized direct access attempt. Redirecting to lobby...");
                router.replace(`/?join=${currentRoom}`);
            } else {
                setIsCheckingAccess(false);
            }
        };

        if (user !== undefined) { // Wait for auth state to load
            enforceSecurity();
        }
    }, [currentRoom, user, router]);

    // Destructure new Yjs objects
    const { code, ytext, provider } = useCollab(currentRoom, nickname);

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
    const [projectData, setProjectData] = useState<any>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    
    const { saveProject, isSaving } = useSaveProject();
    const { createVersion, updateVersion, deleteVersion, isVersioning } = useSaveVersion();
    const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);

    // Listen for User Auth
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Check if this room has been saved before
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
        
        // Update the main working copy
        await saveProject({
            projectId: currentRoom,
            projectName: data.title,
            ownerId: user.id,
            projectDescription: data.description,
            yjsDocState: getDocState()
        });

        // Overwrite the latest version
        if (ytext && ytext.doc) {
            await updateVersion(currentRoom, ytext.doc, user.id, data.versionDescription);
        }

        // Update local database knowledge
        setProjectData({ ...projectData, 
            owner_id: user.id, 
            project_name: data.title,
            project_description: data.description,
            version_description: data.versionDescription
         });
        setIsSaveModalOpen(false);
    };

    const handleCreateNewVersion = async (data: SaveData) => {
        if (!user) return;

        // Update the main working copy (Uint8Array docState)
        await saveProject({
            projectId: currentRoom,
            projectName: data.title,
            ownerId: user.id,
            projectDescription: data.description,
            yjsDocState: getDocState()
        });

        // Create the version history snapshot (Y.Doc object)
        if (ytext && ytext.doc) {
            await createVersion(currentRoom, ytext.doc, user.id, data.versionDescription);
        }

        // Update local database knowledge
        setProjectData({ ...projectData, 
            owner_id: user.id, 
            project_name: data.title,
            project_description: data.description,
            version_description: data.versionDescription});
        setIsSaveModalOpen(false);
    };

    const handleRevertVersion = (revertedText: string) => {
        if (!ytext) return;
    
        // Wrap the changes in a transaction so they happen instantly
        ytext.doc?.transact(() => {
            ytext.delete(0, ytext.length);        // Delete all current code
            ytext.insert(0, revertedText);        // Insert the historical code
        });
    };

    const handleDeleteVersion = async (versionId: string) => {
        return await deleteVersion(currentRoom, versionId);
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


    // early return when verifying access
    // this code must be below all useEffect/useStates
    if (isCheckingAccess) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
                <p className="text-gray-500 font-bold animate-pulse">Verifying access...</p>
            </div>
        );
    }

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
                    onManageVersions={() => setIsVersionsModalOpen(true)}
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
                initialVersionDescription={projectData?.version_description}
                onSaveCurrent={handleSaveCurrentVersion}
                onCreateNewVersion={handleCreateNewVersion}
            />
            <VersionsModal 
                isOpen={isVersionsModalOpen}
                onClose={() => setIsVersionsModalOpen(false)}
                projectId={currentRoom}
                onRevert={handleRevertVersion}
                onDelete={handleDeleteVersion}
            />

        </main>
    );
}