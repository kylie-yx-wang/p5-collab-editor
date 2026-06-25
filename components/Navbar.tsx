"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#fdfdfd] border-b border-[#f0f0f0]">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-[#ff0080] hover:opacity-80 transition">
          p5.js Playground
        </Link>
        <Link href="/gallery" className="text-sm font-medium text-[#333] hover:text-[#119f98] transition">
          Gallery
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/my-projects" className="text-sm font-medium text-[#333] hover:text-[#119f98] transition">
              My Projects
            </Link>
            <div className="h-6 w-px bg-[#f0f0f0]"></div>
            <span className="text-xs text-[#999] truncate max-w-[150px]">{user.email}</span>
          </>
        ) : (
          <Link 
            href="/" 
            className="text-sm font-bold text-[#2873b5] border border-[#2873b5] px-4 py-2 rounded hover:bg-[#2873b5]/10 transition"
          >
            Log In / Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}