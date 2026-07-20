"use client";

import { useCollab } from "@/hooks/useCollab"; 
import { useLocalEditor } from "@/hooks/useLocalEditor"; 
import { Editor } from "@/components/Editor";
import { Preview } from "@/components/Preview";
import { Toolbar } from "@/components/Toolbar";
import { DocsPanel } from "@/components/DocsPanel";
import { use, useState, useEffect } from "react";
import { SaveModal, SaveData } from "@/components/Modals/SavingModal";
import { VersionsModal } from "@/components/Modals/VersionModal";
import { PublishModal } from "@/components/Modals/PublishModal";
import { PasswordModal } from "@/components/Modals/PasswordModal";
import { AboutModal } from "@/components/Modals/AboutModal";
import { CollaboratorModal } from "@/components/Modals/CollaboratorModal";
import { useRouter } from "next/navigation";
import { useSaveProject, useSaveVersion } from "@/hooks/useSaveProject";
import { supabase } from "@/supabase";
import { User } from "@supabase/supabase-js";
import { useRoomLock } from "@/hooks/useRoomLock";
import { toHex, generateUniqueRoomId } from "@/lib/utils";
import * as Y from "yjs";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    const resolvedParams = use(params);
    const currentRoom = resolvedParams.roomId;

    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [nickname, setNickname] = useState<string>("Loading...");
    const router = useRouter();

    useEffect(() => {
        if (user === undefined) return;

        if (user?.email) {
            setNickname(user.email.split("@")[0]);
        } else {
            const cachedGuest = sessionStorage.getItem("guest_identity");
            setNickname(cachedGuest || `Guest ${Math.floor(Math.random() * 1000)}`);
        }
    }, [user]);

    const updateRunCode = () => {
        setRunningCode(code);
        setRunCount(prevCount => prevCount + 1);
    };

    const [autoRun, setAutoRunState] = useState(true);
    const toggleAuto = (autoOn : boolean) => setAutoRunState(autoOn);

    const [jsHelp, setJsHelpState] = useState(true);
    const toggleJSHelp = (helpOn: boolean) => setJsHelpState(helpOn);

    const [p5Help, setP5HelpState] = useState(true);
    const toggleP5Help = (helpOn: boolean) => setP5HelpState(helpOn);

    // --- NEW DARK MODE STATE ---
    const [isDarkMode, setIsDarkMode] = useState(false);
    const toggleDarkMode = (darkOn: boolean) => setIsDarkMode(darkOn);

    const EditorToggles = {
        jsHelp: jsHelp,
        p5Help: p5Help,
    };

    const ToolbarToggleStates = {
        autoRun: autoRun,
        jsHelp: jsHelp,
        p5Help: p5Help,
        isDarkMode: isDarkMode, // Pass down to Toolbar
    };
    
    const ToolbarToggles = {
        setAutoRun: toggleAuto,
        setJsHelp: toggleJSHelp,
        setP5Help: toggleP5Help,
        setIsDarkMode: toggleDarkMode // Pass down to Toolbar
    };

    // --- PERSISTENCE & AUTH STATE ---
    const [projectData, setProjectData] = useState<any>(null);
    const [initialState, setInitialState] = useState<Uint8Array | null | undefined>(undefined);
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const loadRoomAndCheckAccess = async () => {
            const { data: project } = await supabase
                .from('projects')
                .select('*')
                .eq('project_id', currentRoom)
                .maybeSingle();

            if (!project) { 
                router.replace(`/?join=${currentRoom}`);
                return;
            } 

            const isOwner = user && project.owner_id === user.id;
            const isCollaborator = user && project.collaborators?.includes(user.id);
            const hasNoPassword = !project.room_password;
            const hasSessionTicket = sessionStorage.getItem(`room_access_${currentRoom}`) === "true";

            if (!isOwner && !isCollaborator && !(hasNoPassword && user) && !hasSessionTicket) {
                console.warn("Unauthorized direct access attempt. Redirecting to lobby...");
                router.replace(`/?join=${currentRoom}`);
                return;
            }

            setProjectData(project);
            setInitialState(project.yjs_doc_state || null); 
            setIsCheckingAccess(false);
        };

        if (user !== undefined) { 
            loadRoomAndCheckAccess();
        }
    }, [currentRoom, user, router]);

    const hasSavedBefore = Boolean(projectData?.owner_id);
    const hasOwner = Boolean(projectData?.owner_id);
    const isPublished = projectData?.is_published;
    const isOwner = Boolean(user && projectData?.owner_id === user.id);
    const isCollaborator = Boolean(user && projectData?.collaborators?.includes(user.id));   
    const isLocked = projectData?.is_locked;
    
    const canModify = !hasOwner || (!isPublished && !isLocked) || isOwner || isCollaborator;

    const collabState = useCollab(currentRoom, nickname, initialState); 
    const localState = useLocalEditor(initialState);

    const activeState = canModify ? collabState : localState;
    const { code, ytext, provider } = activeState;

    const { activeLock, acquireLock, releaseLock } = useRoomLock(currentRoom);

    const [runningCode, setRunningCode] = useState<string>('');
    const [runCount, setRunCount] = useState(0);
    
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false); 
    const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);

    const { saveProject, isSaving } = useSaveProject();
    const { createVersion, updateVersion, deleteVersion, isVersioning } = useSaveVersion();

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

    const getDocState = () => {
        if (!ytext?.doc) return undefined;
        return Y.encodeStateAsUpdate(ytext.doc);
    };

    const handleSaveCurrentVersion = async (data: SaveData) => {
        if (!user) return;
        if (activeLock) {
            alert(`${activeLock.user} is currently ${activeLock.action}. Please wait a moment.`);
            return;
        }

        await acquireLock(nickname, "saving the project");
        
        try {
            await saveProject({
                projectId: currentRoom,
                projectName: data.title,
                ownerId: user.id,
                projectDescription: data.description,
                yjsDocState: getDocState()
            });

            if (ytext && ytext.doc) {
                await updateVersion(currentRoom, ytext.doc, user.id, data.versionDescription);
            }

            setProjectData({ ...projectData, 
                owner_id: user.id, 
                project_name: data.title,
                project_description: data.description,
                version_description: data.versionDescription
            });
            setIsSaveModalOpen(false);
        } finally {
            await releaseLock();
        }
    };

    const handleCreateNewVersion = async (data: SaveData) => {
        if (!user) return;
        if (activeLock) {
            alert(`${activeLock.user} is currently ${activeLock.action}. Please wait a moment.`);
            return;
        }

        await acquireLock(nickname, "saving the project");

        try {
            await saveProject({
                projectId: currentRoom,
                projectName: data.title,
                ownerId: user.id,
                projectDescription: data.description,
                yjsDocState: getDocState()
            });

            if (ytext && ytext.doc) {
                await createVersion(currentRoom, ytext.doc, user.id, data.versionDescription);
            }

            setProjectData({ ...projectData, 
                owner_id: user.id, 
                project_name: data.title,
                project_description: data.description,
                version_description: data.versionDescription});
            setIsSaveModalOpen(false);
        } finally {
            await releaseLock();
        }
    };

    const handleRevertVersion = (revertedText: string) => {
        if (!ytext) return;
        ytext.doc?.transact(() => {
            ytext.delete(0, ytext.length);        
            ytext.insert(0, revertedText);        
        });
    };

    const handleDeleteVersion = async (versionId: string) => {
        if (activeLock) {
            alert(`${activeLock.user} is currently ${activeLock.action}. Please wait a moment.`);
            return { success: false, error: "Room is currently locked by another user." };
        }

        await acquireLock(nickname, "deleting a previous version");
        try {
            return await deleteVersion(currentRoom, versionId);
        } finally {
            await releaseLock();
        }
    };

    const handlePublish = async (data: { title: string; description: string; authorName: string }) => {
        if (activeLock) {
            alert(`${activeLock.user} is currently ${activeLock.action}. Please wait a moment.`);
            return;
        }

        const docState = getDocState();
        if (!docState) {
            alert("Error: The document is not fully loaded yet. Please try again.");
            return;
        }

        await acquireLock(nickname, "publishing the project");

        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    project_name: data.title,
                    project_description: data.description,
                    author_name: data.authorName,
                    is_published: true,
                    room_password: null,
                    yjs_doc_state: toHex(docState)
                })
                .eq('project_id', currentRoom);
        
            if (error) throw error;
        } finally {
            await releaseLock();
        }
    };

    useEffect(() => {
        if (autoRun) {
            setRunningCode(code);
            setRunCount(prevCount => prevCount + 1);
        }
    }, [code, autoRun]);

    const handleSavePassword = async (newPassword: string | null, isLocked: boolean) => {
        const { error } = await supabase
            .from('projects')
            .update({ 
                room_password: newPassword,
                is_locked: isLocked 
            })
            .eq('project_id', currentRoom);
            
        if (error) throw error;
        setProjectData({ ...projectData, room_password: newPassword, is_locked: isLocked });
    };

    const handleFork = async () => {
        const currentState = getDocState();
        if (!currentState) {
            alert("The document is still loading. Please wait a moment.");
            return;
        }

        const newRoomId = await generateUniqueRoomId();

        try {
            const { error } = await supabase.from('projects').insert({
                project_id: newRoomId,
                project_name: `${projectData?.project_name || 'Untitled'} (Fork)`,
                owner_id: user?.id || null, 
                forked_from: currentRoom,
                yjs_doc_state: toHex(currentState)
            });

            if (error) throw error;

            router.push(`/room/${newRoomId}`); 
        } catch (err) {
            console.error("Failed to fork project:", err);
            alert("Something went wrong while creating the fork.");
        }
    };

    if (isCheckingAccess) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
                <p className="text-gray-500 font-bold animate-pulse">Verifying access...</p>
            </div>
        );
    }

    return (
        <main className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
            
            {canModify ? (
                <Toolbar 
                    roomId={currentRoom} 
                    onRun={updateRunCode}
                    ToolbarToggleStates={ToolbarToggleStates}
                    ToolbarToggles={ToolbarToggles}
                    canModify={canModify}
                    isOwner={isOwner}
                    onSave={() => setIsSaveModalOpen(true)}
                    onManageVersions={() => setIsVersionsModalOpen(true)}
                    onPublish={() => setIsPublishModalOpen(true)}
                    onPassword={() => setIsPasswordModalOpen(true)}
                    onCollaborators={() => setIsCollaboratorModalOpen(true)}
                    onFork={handleFork}
                />
            ) : (
                <div className="bg-white border-b border-gray-200 text-gray-500 p-2 font-mono flex justify-between items-center shrink-0 min-h-[48px]">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">
                            Project: <span className="text-purple-600 font-bold">{projectData?.project_name || "Untitled Project"}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-300">
                            READ ONLY
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleFork}
                            className="bg-[#119f98] hover:bg-[#0e8a83] text-white text-sm font-bold px-4 py-1.5 rounded shadow-sm transition active:scale-95"
                        >
                            Fork Project
                        </button>
                        <button 
                            onClick={() => setIsAboutModalOpen(true)}
                            className="text-sm font-semibold px-3 py-1 transition-colors text-gray-600 hover:text-purple-600"
                        >
                            About Project
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 flex w-full overflow-hidden">
                
                {/* Dynamically adjust the background color of the wrapper to match the dark theme */}
                <div className={`w-1/2 flex flex-col h-full border-r-1 border-gray-300 transition-colors ${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
                    <div className="h-[70%] w-full flex flex-col">
                        <Editor 
                            roomId={currentRoom}
                            onRun={updateRunCode}
                            toggles={EditorToggles}
                            ytext={ytext}
                            provider={provider}
                            theme={isDarkMode ? 'dark' : 'light'} // Pass the theme prop down
                        />
                    </div>
                    <div className="h-[30%] w-full border-t-1 border-gray-300 flex flex-col">
                        <DocsPanel />
                    </div>
                </div>

                <div className="w-1/2 h-full flex flex-col bg-white">
                    <Preview 
                        code={runningCode}
                        key={runCount}
                    />
                </div>
            </div>

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
            <PublishModal 
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                user={user}
                project={projectData}
                onPublish={handlePublish}
            />
            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                currentPassword={projectData?.room_password}
                currentIsLocked={projectData?.is_locked}
                onSave={handleSavePassword}
            />
            <AboutModal
                isOpen={isAboutModalOpen}
                onClose={() => setIsAboutModalOpen(false)}
                project={projectData}
            />
            <CollaboratorModal
                isOpen={isCollaboratorModalOpen}
                onClose={() => setIsCollaboratorModalOpen(false)}
                projectId={currentRoom}
            />

        </main>
    );
}