import Link from "next/link";
import { Project } from "@/hooks/useGetProjects";

interface ProjectGridProps {
  projects: Project[];
  emptyMessage?: string;
  onDeleteProject?: (projectId: string) => void;
}

export function ProjectGrid({ projects, emptyMessage = "No projects found.", onDeleteProject }: ProjectGridProps) {
  // Handle the delete click safely
  const handleDeleteClick = (e: React.MouseEvent, projectId: string, projectName: string) => {
    e.preventDefault(); // Prevents the <Link> from navigating to the room
    e.stopPropagation(); // Stops the click from bubbling up

    if (!onDeleteProject) return;

    if (window.confirm(`Are you sure you want to permanently delete "${projectName}" for everyone?`)) {
      onDeleteProject(projectId);
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="col-span-full p-12 text-center border-2 border-dashed border-[#f0f0f0] rounded-lg text-[#999]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link href={`/room/${project.project_id}`} key={project.project_id}>
          {/* Card Wrapper */}
          <div className="relative h-48 border border-[#119f98]/30 rounded-lg bg-[#119f98]/5 p-4 flex flex-col justify-between hover:shadow-md hover:border-[#119f98] transition cursor-pointer group">
            {/* Delete Button (Visible on Hover) */}
            {onDeleteProject && (
              <button
                onClick={(e) => handleDeleteClick(e, project.project_id, project.project_name)}
                className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded p-1.5 shadow-sm border border-gray-200"
                title="Delete Project"
              >
                🗑️
              </button>
            )}
            
            {/* Thumbnail / Description Box */}
            <div className="flex justify-between items-start">
              <div className="h-20 w-full bg-[#119f98]/10 rounded group-hover:bg-[#119f98]/20 transition duration-300 p-3 overflow-hidden">
                <p className="text-xs text-[#555] line-clamp-3 pr-6 leading-relaxed" title={project.project_description}>
                  {project.project_description || "No description provided."}
                </p>
              </div>
            </div>
            
            {/* Card Info */}
            <div className="mt-4 flex justify-between items-end">
              <div className="overflow-hidden pr-2">
                <h3 className="font-semibold text-[#333] truncate" title={project.project_name}>
                  {project.project_name}
                </h3>
                <p className="text-xs text-[#999] mt-0.5">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {/* Conditional Published Badge */}
              {project.is_published && (
                <span className="shrink-0 text-[10px] uppercase font-bold text-[#ff0080] bg-[#ff0080]/10 px-2 py-1 rounded mb-0.5">
                  Published
                </span>
              )}
            </div>
            
          </div>
        </Link>
      ))}
    </div>
  );
}

interface GalleryGridProps {
  projects: Project[];
  emptyMessage?: string;
  onDeleteProject?: (projectId: string) => void;
}

export function GalleryGrid({ projects, emptyMessage = "No projects found." }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link href={`/room/${project.project_id}`} key={project.project_id}>
          {/* Card Wrapper */}
          <div className="relative h-48 border border-[#119f98]/30 rounded-lg bg-[#119f98]/5 p-4 flex flex-col justify-between hover:shadow-md hover:border-[#119f98] transition cursor-pointer group">
            
            {/* Thumbnail / Description Box */}
            <div className="flex justify-between items-start">
              <div className="h-20 w-full bg-[#119f98]/10 rounded group-hover:bg-[#119f98]/20 transition duration-300 p-3 overflow-hidden">
                <p className="text-xs text-[#555] line-clamp-3 leading-relaxed" title={project.project_description}>
                  {project.project_description || "No description provided."}
                </p>
              </div>
            </div>
            
            {/* Card Info */}
            <div className="mt-4 flex justify-between items-end">
              <div className="overflow-hidden pr-2">
                <h3 className="font-semibold text-[#333] truncate" title={project.project_name}>
                  {project.project_name}
                </h3>
                <p className="text-xs text-[#999] mt-0.5">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
          </div>
        </Link>
      ))}
    </div>
  );
}