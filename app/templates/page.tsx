"use client";

import { useTemplateProjects } from "@/hooks/useProjects";
import { GalleryGrid } from "@/components/ProjectsDisplay";

export default function TemplatesPage() {
  const { projects, loading } = useTemplateProjects();

  return (
    <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#119f98]">Starter Templates</h1>
          <p className="text-[#999] mt-2">Kickstart your next project with these official templates.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#999]">Loading templates...</div>
      ) : (
        <GalleryGrid 
          projects={projects} 
          emptyMessage="No templates are currently available." 
        />
      )}
    </main>
  );
}