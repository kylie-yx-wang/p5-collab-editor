"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { AuthPanel } from '@/components/AuthPanel';

export default function Home() {
  const router = useRouter();
  
  const [roomInput, setRoomInput] = useState("");
  const [user, setUser] = useState<any>(null);

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
    async function testDatabaseConnection() {
      if (!user) return; 
      
      console.log("Testing Supabase connection as authenticated user...");
      const { data, error } = await supabase.from('projects').select('*').limit(1);

      if (error) {
        console.error("❌ Supabase Connection Error:", error.message);
      } else {
        console.log("✅ Supabase Connected Successfully! Data received:", data);
      }
    }

    testDatabaseConnection();
  }, [user]);

  const handleCreateRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    router.push(`/room/${randomId}`);
  };

  const handleJoinRoom = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (roomInput.trim()) {
      router.push(`/room/${roomInput.trim()}`);
    }
  };


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
            className="bg-[#119f98] text-[#fdfdfd] font-bold py-3 px-4 rounded hover:opacity-90 transition"
          >
            Create New Canvas
          </button>

          <div className="flex items-center justify-center">
            <span className="text-[#999]">or</span>
          </div>

          <form onSubmit={handleJoinRoom} className="flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Enter Room Code..." 
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              className="border border-[#f0f0f0] p-3 rounded outline-none focus:border-[#ff0080] bg-white text-center"
            />
            <button 
              type="submit"
              className="bg-[#8a2be2] text-white font-bold py-3 px-4 rounded hover:opacity-90 transition"
            >
              Join Existing Canvas
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}