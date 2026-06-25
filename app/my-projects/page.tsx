"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useUserProjects } from "@/hooks/useProjects"; 
import { ProjectGrid } from "@/components/ProjectsDisplay";

export default function MyProjects() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Fetch projects using our custom hook
  const { projects, loading: projectsLoading } = useUserProjects(user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });
  }, []);

  if (authLoading || projectsLoading) {
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

      {/* RENDER THE GRID HERE */}
      <ProjectGrid 
        projects={projects} 
        emptyMessage="You haven't created any canvases yet. Click '+ New Project' to get started!" 
      />
      
    </main>
  );
}