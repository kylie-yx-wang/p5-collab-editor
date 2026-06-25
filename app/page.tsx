"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';

export default function Home() {
  const router = useRouter();
  
  const [roomInput, setRoomInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [authMessage, setAuthMessage] = useState("");

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

  const handleSignUp = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setAuthMessage("Signing up...");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthMessage(`❌ ${error.message}`);
    else setAuthMessage("✅ Success! (Check email for confirmation if enabled in Supabase)");
  };

  const handleSignIn = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setAuthMessage("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthMessage(`❌ ${error.message}`);
    else setAuthMessage("✅ Signed in successfully!");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthMessage("Signed out.");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] bg-[#fdfdfd] text-[#333] p-8">
      <h1 className="text-4xl font-bold text-[#ff0080] mb-8 text-center">
        p5.js Collaborative Playground
      </h1>

      <div className="flex flex-row flex-wrap gap-12 w-full max-w-4xl justify-center items-stretch">
        
        {/* LEFT COLUMN: Auth Panel */}
        <div className="flex flex-col gap-4 w-80 bg-[#f0f0f0]/50 p-6 border border-[#f0f0f0] rounded-lg">
          <h2 className="text-2xl font-semibold mb-2 text-[#333]">Account</h2>
          
          {user ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#119f98] font-medium">Logged in as:</p>
              <p className="text-xs truncate bg-[#f0f0f0] p-2 rounded">{user.email}</p>
              <button 
                onClick={handleSignOut}
                className="mt-4 bg-[#f0f0f0] text-[#333] font-bold py-2 px-4 rounded hover:bg-[#e0e0e0] transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-[#f0f0f0] p-2 rounded outline-none focus:border-[#ff0080] bg-white"
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-[#f0f0f0] p-2 rounded outline-none focus:border-[#ff0080] bg-white"
              />
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={handleSignIn}
                  className="flex-1 bg-[#2873b5] text-white font-bold py-2 rounded hover:opacity-90 transition"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleSignUp}
                  className="flex-1 border border-[#2873b5] text-[#2873b5] font-bold py-2 rounded hover:bg-[#2873b5]/10 transition"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}
          {authMessage && (
            <p className="text-sm mt-2 text-center font-medium text-[#8a2be2]">{authMessage}</p>
          )}
        </div>

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