"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { AuthPanel } from '@/components/AuthPanel';
import { StagingModal } from '@/components/Modals/StagingModal';
import { generateUniqueRoomId } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  
  const [roomInput, setRoomInput] = useState("");
  const [user, setUser] = useState<any>(null);

  // Staging modal states
  const [isStagingOpen, setIsStagingOpen] = useState(false);
  const [stagingMode, setStagingMode] = useState<"create" | "join">("join");
  const [stagingRoomId, setStagingRoomId] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);

  // UI feedback states
  const [isProcessing, setIsProcessing] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);


  const handleCreateRoom = async () => {
    setIsProcessing(true);
    setJoinError("");

    const uniqueId = await generateUniqueRoomId();

    // Open Staging Modal in Create mode
    setStagingRoomId(uniqueId);
    setStagingMode("create");
    setRequiresPassword(false);
    setIsStagingOpen(true);
    setIsProcessing(false);
  };

  const handleJoinRoom = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const cleanInput = roomInput.trim();
    if (!cleanInput) return;

    setIsProcessing(true);
    setJoinError("");

    // Check if the room exists
    const { data: project, error } = await supabase
      .from('projects')
      .select('owner_id, collaborators, room_password')
      .eq('project_id', cleanInput)
      .maybeSingle();

    if (!project) {
      setJoinError("This room doesn't exist, create room instead.");
      setIsProcessing(false);
      return;
    }

    // Bypass check (Owners and Collaborators)
    const isOwner = user && project.owner_id === user.id;
    const isCollaborator = user && project.collaborators?.includes(user.id);

    if (isOwner || isCollaborator) {
      // Skip the modal completely and drop them right in
      router.push(`/room/${cleanInput}`);
      return;
    }

    // Else open the Staging Modal in Join mode
    setStagingRoomId(cleanInput);
    setStagingMode("join");
    setRequiresPassword(!!project.room_password); // true if password exists
    setIsStagingOpen(true);
    setIsProcessing(false);
  };

  // --- MODAL SUBMIT HANDLER ---
  const handleStagingSubmit = async ({ nickname, password }: { nickname: string, password?: string }) => {
    if (stagingMode === "create") {
      // Create the room entry in the database right before they enter
      const { error } = await supabase.from('projects').insert({
        project_id: stagingRoomId,
        room_password: password || null,
        project_name: "Untitled Project",
        // If they are logged in, make them the owner
        ...(user ? { owner_id: user.id } : {}) 
      });

      if (error) throw new Error(error.message);
      
      router.push(`/room/${stagingRoomId}`);

    } else {
      // JOIN MODE: Verify the password if one is required
      if (requiresPassword) {
        const { data } = await supabase
          .from('projects')
          .select('room_password')
          .eq('project_id', stagingRoomId)
          .single();

        if (data?.room_password !== password) {
          throw new Error("Incorrect room password."); // This string is caught and displayed by StagingModal
        }
      }
      
      router.push(`/room/${stagingRoomId}`);
    }
  };



  // URL Parameter checking useEffect
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const joinRoomId = searchParams.get("join"); // trying to join room from direct link
    const action = searchParams.get("action"); // action

    if (joinRoomId && user !== undefined) {
      // Trigger the join logic automatically
      setRoomInput(joinRoomId);
      
      // We wrap the logic in an async IIFE to reuse your existing checks
      (async () => {
        setIsProcessing(true);
        const { data: project } = await supabase
          .from('projects')
          .select('room_password')
          .eq('project_id', joinRoomId)
          .maybeSingle();

        if (project) {
            setStagingRoomId(joinRoomId);
            setStagingMode("join");
            setRequiresPassword(!!project.room_password);
            setIsStagingOpen(true);
        } else {
            setJoinError("The room you tried to join does not exist.");
        }
        setIsProcessing(false);
      })();
      
      // Clean up the URL so it looks nice again
      window.history.replaceState({}, document.title, "/");
    } else if (action === "create" && user !== undefined) {
      handleCreateRoom();
      
      // Clean up the URL
      window.history.replaceState({}, document.title, "/");
    }
  }, [user]); // Runs once the user's auth state is known


  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] bg-[#fdfdfd] text-[#333] p-8">
      <h1 className="text-4xl font-bold text-[#ff0080] mb-8 text-center">
        p5.js Collaborative Playground
      </h1>

      <div className="flex flex-row flex-wrap gap-12 w-full max-w-4xl justify-center items-stretch">
        <AuthPanel />

        {/* RIGHT COLUMN: Room Panel */}
        <div className="flex flex-col gap-6 w-80 justify-center">
          <button 
            onClick={handleCreateRoom}
            disabled={isProcessing}
            className="bg-[#119f98] text-[#fdfdfd] font-bold py-3 px-4 rounded hover:opacity-90 transition disabled:opacity-50"
          >
            {isProcessing && stagingMode === "create" ? "Checking..." : "Create New Canvas"}
          </button>

          <div className="flex items-center justify-center">
            <span className="text-[#999]">or</span>
          </div>

          <form onSubmit={handleJoinRoom} className="flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Enter Room Code..." 
              value={roomInput}
              onChange={(e) => {
                setRoomInput(e.target.value);
                setJoinError(""); // Clear error when they start typing
              }}
              className="border border-[#f0f0f0] p-3 rounded outline-none focus:border-[#ff0080] bg-white text-center"
            />
            {joinError && (
              <p className="text-xs text-red-500 font-bold text-center">{joinError}</p>
            )}
            <button 
              type="submit"
              disabled={isProcessing}
              className="bg-[#8a2be2] text-white font-bold py-3 px-4 rounded hover:opacity-90 transition disabled:opacity-50"
            >
               {isProcessing && stagingMode === "join" ? "Locating..." : "Join Existing Canvas"}
            </button>
          </form>
        </div>
      </div>

      {/* STAGING MODAL INJECTION */}
      <StagingModal 
        isOpen={isStagingOpen}
        onClose={() => setIsStagingOpen(false)}
        mode={stagingMode}
        roomId={stagingRoomId}
        requiresPassword={requiresPassword}
        user={user}
        onSubmit={handleStagingSubmit}
      />
      
    </main>
  );
}