"use client";

import { useGalleryProjects } from "@/hooks/useProjects"; // From our earlier step
import { ProjectGrid } from "@/lib/displayProjects"; // The new component

export default function AllProjects() {
  // Fetch projects using our custom hook
  const { projects, loading: projectsLoading } = useGalleryProjects();
  return (
    <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#119f98]">Public Gallery</h1>
          <p className="text-[#999] mt-2">Explore and fork canvases created by the community.</p>
        </div>
        <button className="bg-[#119f98] text-white px-4 py-2 rounded font-bold hover:opacity-90 transition">
          + New Project
        </button>
      </div>

      <ProjectGrid 
        projects={projects} 
        emptyMessage="No one has published a canvas yet. Be the first!" 
      />
    </main>
  );
}