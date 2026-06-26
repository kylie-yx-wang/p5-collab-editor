"use client";

import { useGalleryProjects } from "@/hooks/useProjects";
import { GalleryGrid } from "@/components/ProjectsDisplay";

export default function AllProjects() {
  // Fetch projects using custom hook
  const { projects, loading: projectsLoading } = useGalleryProjects();
  return (
    <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#119f98]">Public Gallery</h1>
          <p className="text-[#999] mt-2">Explore and fork canvases created by the community.</p>
        </div>
      </div>

      <GalleryGrid 
        projects={projects} 
        emptyMessage="No one has published a canvas yet. Be the first!" 
      />
    </main>
  );
}