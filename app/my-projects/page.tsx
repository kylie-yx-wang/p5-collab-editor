"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function MyProjects() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[#999]">Loading your canvas collection...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 w-full h-[60vh]">
        <h2 className="text-2xl font-bold text-[#333]">You are not logged in</h2>
        <p className="text-[#999]">Create an account to save and manage your permanent projects.</p>
        <Link href="/" className="bg-[#2873b5] text-white px-6 py-2 rounded font-bold hover:opacity-90 transition">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#119f98]">My Projects</h1>
          <p className="text-[#999] mt-2">Manage your saved canvases and publishing settings.</p>
        </div>
        <button className="bg-[#119f98] text-white px-4 py-2 rounded font-bold hover:opacity-90 transition">
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="h-48 border border-[#119f98]/30 rounded-lg bg-[#119f98]/5 p-4 flex flex-col justify-between hover:shadow-sm transition">
          <div className="flex justify-between items-start">
            <div className="h-20 w-full bg-[#119f98]/20 rounded animate-pulse"></div>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <h3 className="font-semibold text-[#333]">My First Game</h3>
              <p className="text-xs text-[#999]">Last edited just now</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#ff0080] bg-[#ff0080]/10 px-2 py-1 rounded">
              Published
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}