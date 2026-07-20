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
      setJoinError("This room doesn't exist. Try creating one instead!");
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
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] bg-[#fdfdfd] text-[#333] p-4 md:p-8">
      
      {/* Header Area */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#ff0080] mb-4 tracking-tight">
          p5.js Collaborative Playground
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Code, create, and collaborate in real-time. Choose how you want to start below!
        </p>
      </div>

      {/* Main Split Container */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative">
        
        {/* LEFT COLUMN: Auth / Accounts */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800">Save Your Work</h2>
            <p className="text-sm text-gray-500 mt-2">
              Sign up or log in to save your canvases, publish to the gallery, and keep your code secure.
            </p>
          </div>
          <AuthPanel />
        </div>

        {/* DESKTOP DIVIDER */}
        <div className="hidden md:flex flex-col items-center justify-center relative w-px bg-gray-200 my-8">
          <div className="absolute bg-white px-3 py-2 text-gray-400 font-bold text-sm border border-gray-200 rounded-full shadow-sm">
            OR
          </div>
        </div>

        {/* MOBILE DIVIDER */}
        <div className="flex md:hidden items-center justify-center w-full relative h-px bg-gray-200 my-4">
          <div className="absolute bg-white px-3 py-1 text-gray-400 font-bold text-xs border border-gray-200 rounded-full">
            OR
          </div>
        </div>

        {/* RIGHT COLUMN: Guest / Quick Start */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-gray-50/50">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800">Jump Right In</h2>
            <p className="text-sm text-gray-500 mt-2">
              No account required. Create a temporary canvas or enter a code to join a friend instantly.
            </p>
          </div>

          <div className="flex flex-col gap-6 w-full max-w-sm mx-auto md:mx-0">
            {/* Create Room Button */}
            <button 
              onClick={handleCreateRoom}
              disabled={isProcessing}
              className="w-full bg-[#119f98] text-[#fdfdfd] font-bold py-3.5 px-4 rounded-xl hover:bg-[#0e8a83] hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {isProcessing && stagingMode === "create" ? "Checking..." : "Create New Canvas"}
            </button>

            <div className="flex items-center justify-center opacity-60 my-2">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Join Existing</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Join Room Form */}
            <form onSubmit={handleJoinRoom} className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Enter Room Code" 
                value={roomInput}
                onChange={(e) => {
                  setRoomInput(e.target.value);
                  setJoinError(""); // Clear error when they start typing
                }}
                className="w-full border-2 border-gray-200 p-3.5 rounded-xl outline-none focus:border-[#8a2be2] transition-colors text-center font-mono text-lg tracking-wider bg-white placeholder:tracking-normal placeholder:font-sans placeholder:text-base placeholder:text-gray-400"
              />
              {joinError && (
                <p className="text-sm text-red-500 font-bold text-center bg-red-50 py-1.5 rounded-md">{joinError}</p>
              )}
              <button 
                type="submit"
                disabled={isProcessing || !roomInput.trim()}
                className="w-full bg-[#8a2be2] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#7721c5] hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                {isProcessing && stagingMode === "join" ? "Locating..." : "Join Canvas"}
              </button>
            </form>
          </div>
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