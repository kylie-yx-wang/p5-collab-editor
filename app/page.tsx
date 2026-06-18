"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from 'react';
import { supabase } from '@/supabase';


export default function Home() {
  useEffect(() => {
    async function testDatabaseConnection() {
      console.log("Testing Supabase connection...");
      
      // Try to fetch data from the projects table
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

      if (error) {
        console.error("❌ Supabase Connection Error:", error.message);
      } else {
        console.log("✅ Supabase Connected Successfully! Data received:", data);
      }
    }

    testDatabaseConnection();
  }, []);

  const router = useRouter();
  const [roomInput, setRoomInput] = useState("");

  // Generates a random 6-character room code
  const handleCreateRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    router.push(`/room/${randomId}`);
  };

  // Joins a specific room typed by the user
  const handleJoinRoom = (e: React.SyntheticEvent) => {
    e.preventDefault(); // prevents from reloading after submit
    if (roomInput.trim()) {
      router.push(`/room/${roomInput.trim()}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-[#fdfdfd] text-[#333]">
      <h1 className="text-4xl font-bold text-pink-500 mb-8">p5.js Collaborative Playground</h1>
      
      <div className="flex flex-col gap-6 w-80">
        <button 
          onClick={handleCreateRoom}
          className="bg-teal-500 text-white font-bold py-3 px-4 rounded hover:bg-teal-600 transition"
        >
          Create New Canvas
        </button>

        <div className="flex items-center justify-center">
          <span className="text-gray-400">or</span>
        </div>

        <form onSubmit={handleJoinRoom} className="flex flex-col gap-2">
          <input 
            type="text" 
            placeholder="Enter Room Code..." 
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            className="border border-gray-300 p-3 rounded outline-none focus:border-pink-500"
          />
          <button 
            type="submit"
            className="bg-purple-600 text-white font-bold py-3 px-4 rounded hover:bg-purple-700 transition"
          >
            Join Existing Canvas
          </button>
        </form>
      </div>
    </main>
  );
}