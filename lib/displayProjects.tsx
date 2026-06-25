import Link from "next/link";
import { Project } from "@/hooks/useProjects"; // Adjust import path if needed

interface ProjectGridProps {
  projects: Project[];
  emptyMessage?: string;
}

export function ProjectGrid({ projects, emptyMessage = "No projects found." }: ProjectGridProps) {
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
          <div className="h-48 border border-[#119f98]/30 rounded-lg bg-[#119f98]/5 p-4 flex flex-col justify-between hover:shadow-md hover:border-[#119f98] transition cursor-pointer group">
            
            {/* Thumbnail Placeholder */}
            <div className="flex justify-between items-start">
              <div className="h-20 w-full bg-[#119f98]/10 rounded group-hover:bg-[#119f98]/20 transition duration-300"></div>
            </div>
            
            {/* Card Info */}
            <div className="mt-4 flex justify-between items-end">
              <div className="overflow-hidden pr-2">
                <h3 className="font-semibold text-[#333] truncate" title={project.project_name}>
                  {project.project_name}
                </h3>
                <p className="text-xs text-[#999]">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {/* Conditional Published Badge */}
              {project.is_published && (
                <span className="shrink-0 text-[10px] uppercase font-bold text-[#ff0080] bg-[#ff0080]/10 px-2 py-1 rounded">
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