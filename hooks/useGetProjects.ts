import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';

// TypeScript interface based on your SQL schema
export interface Project {
  project_id: string;
  project_name: string;
  is_published: boolean;
  version_num: number;
  owner_id: string;
  collaborators: string[];
  forked_from: string | null;
  created_at: string;
  project_description: string;
  is_template?: boolean;
}

/**
 * Hook for the /gallery page
 * Fetches all globally published projects.
 */
export const useGalleryProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('project_id, project_name, is_published, version_num, owner_id, collaborators, forked_from, created_at, project_description')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching gallery:", error);
        setError(error.message);
      } else {
        setProjects(data || []);
      }
      
      setLoading(false);
    };

    fetchGallery();
  }, []);

  return { projects, loading, error };
};

/**
 * Hook for the /projects page
 * Fetches projects owned by the user OR where the user is a collaborator.
 */
export const useUserProjects = (userId: string | undefined | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no user is logged in, immediately return empty state
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const fetchUserProjects = async () => {
      setLoading(true);
      
      // The .or() syntax here checks two things:
      // 1. owner_id.eq.${userId} -> Is the user the owner?
      // 2. collaborators.cs.{${userId}} -> Does the collaborators array "contain" (cs) this user's ID?
      const { data, error } = await supabase
        .from('projects')
        .select('project_id, project_name, is_published, version_num, owner_id, collaborators, forked_from, created_at, project_description')
        .or(`owner_id.eq.${userId},collaborators.cs.{${userId}}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching user projects:", error);
        setError(error.message);
      } else {
        setProjects(data || []);
      }
      
      setLoading(false);
    };

    fetchUserProjects();
  }, [userId]);

  return { projects, loading, error };
};

/**
 * Hook for the /templates page
 * Fetches all projects explicitly marked as templates.
 */
export const useTemplateProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('project_id, project_name, is_published, version_num, owner_id, collaborators, forked_from, created_at, project_description')
        .eq('is_template', true) // <-- the filter
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching templates:", error);
        setError(error.message);
      } else {
        setProjects(data || []);
      }
      
      setLoading(false);
    };

    fetchTemplates();
  }, []);

  return { projects, loading, error };
};