import { useState } from 'react';
import { supabase } from '@/supabase';

// We make all fields optional except projectId
export interface SaveProjectParams {
  projectId: string;
  projectName?: string;
  isPublished?: boolean;
  ownerId?: string;
  yjsDocState?: Uint8Array; // Yjs binary state
}

export const useSaveVersion = () => {
    
}

export const useSaveProject = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveProject = async (params: SaveProjectParams) => {
    setIsSaving(true);
    setSaveError(null);

    // We only attach fields that were actually passed into the function.
    const payload: Record<string, any> = {
      project_id: params.projectId,
    };

    if (params.projectName !== undefined) payload.project_name = params.projectName;
    if (params.isPublished !== undefined) payload.is_published = params.isPublished;
    if (params.ownerId !== undefined) payload.owner_id = params.ownerId;
    if (params.yjsDocState !== undefined) payload.yjs_doc_state = params.yjsDocState;

    // Perform the "Upsert"
    const { data, error } = await supabase
      .from('projects')
      .upsert(payload, { onConflict: 'project_id' })
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      console.error("❌ Error saving project:", error.message);
      setSaveError(error.message);
      return { success: false, error: error.message };
    }

    console.log("✅ Project saved successfully!");
    return { success: true, data };
  };

  return { saveProject, isSaving, saveError };
};