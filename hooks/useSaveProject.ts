import { useState } from 'react';
import { supabase } from '@/supabase';
import * as Y from 'yjs';

// We make all fields optional except projectId
export interface SaveProjectParams {
  projectId: string;
  projectName?: string;
  isPublished?: boolean;
  ownerId?: string;
  projectDescription?: string;
  versionDescription?: string;
  yjsDocState?: Uint8Array; // Full Yjs binary state (for the main project row)
}

// // Safely convert Base64 string back to Yjs Uint8Array
// const fromBase64 = (base64: string) => {
//     const binaryStr = atob(base64);
//     const bytes = new Uint8Array(binaryStr.length);
//     for (let i = 0; i < binaryStr.length; i++) {
//       bytes[i] = binaryStr.charCodeAt(i);
//     }
//     return bytes;
//   };
  
//   // Safely convert Yjs Uint8Array to Base64 string for database
//   const toBase64 = (bytes: Uint8Array) => {
//     let binaryStr = '';
//     for (let i = 0; i < bytes.byteLength; i++) {
//       binaryStr += String.fromCharCode(bytes[i]);
//     }
//     return btoa(binaryStr);
//   };

// Safely convert Postgres Hex string (e.g., "\x001a2b...") back to Yjs Uint8Array
const fromHex = (hexStr: string) => {
    // Remove the "\x" prefix that Postgres automatically adds
    const cleanHex = hexStr.startsWith('\\x') ? hexStr.slice(2) : hexStr;
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  };
  
  // Safely convert Yjs Uint8Array to Postgres Hex format
  const toHex = (bytes: Uint8Array) => {
    let hexStr = '\\x'; // Postgres bytea prefix
    for (let i = 0; i < bytes.length; i++) {
      hexStr += bytes[i].toString(16).padStart(2, '0');
    }
    return hexStr;
  };

export const useSaveProject = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveProject = async (params: SaveProjectParams) => {
    setIsSaving(true);
    setSaveError(null);

    const payload: Record<string, any> = {
      project_id: params.projectId,
    };

    if (params.projectName !== undefined) payload.project_name = params.projectName;
    if (params.isPublished !== undefined) payload.is_published = params.isPublished;
    if (params.ownerId !== undefined) payload.owner_id = params.ownerId;
    if (params.projectDescription !== undefined) payload.project_description = params.projectDescription;
    if (params.yjsDocState !== undefined) payload.yjs_doc_state = params.yjsDocState;

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

    return { success: true, data };
  };

  return { saveProject, isSaving, saveError };
};

export const useSaveVersion = () => {
  const [isVersioning, setIsVersioning] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);

  const createVersion = async (
    projectId: string, 
    liveDoc: Y.Doc, 
    userId: string, 
    versionDescription: string
  ) => {
    setIsVersioning(true);
    setVersionError(null);

    try {
      // Enforce the 50-version limit
      const { count, error: countError } = await supabase
        .from('project_versions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      if (countError) throw countError;
      
      if (count && count >= 50) {
        throw new Error("Version limit reached. Please delete old versions to save new ones.");
      }

      // Fetch the existing history to calculate the diff
      const { data: pastVersions, error: fetchError } = await supabase
        .from('project_versions')
        .select('yjs_state')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Reconstruct the database's current knowledge in a temporary document
      const tempDoc = new Y.Doc();
      if (pastVersions && pastVersions.length > 0) {
        pastVersions.forEach(version => {
          if (version.yjs_state) {
            // Convert the bytea string/buffer back to Uint8Array before applying
            const updateMap = fromHex(version.yjs_state);
            Y.applyUpdate(tempDoc, updateMap);
          }
        });
      }

      // Get the state vector of the temporary doc and calculate the exact diff
      const dbStateVector = Y.encodeStateVector(tempDoc);
      const diffUpdate = Y.encodeStateAsUpdate(liveDoc, dbStateVector);

      // If the diff is empty (no changes), you might want to abort here to save space!
      if (diffUpdate.length === 2 && diffUpdate[0] === 0 && diffUpdate[1] === 0) {
        setIsVersioning(false);
        return { success: true, message: "No new changes to version." };
      }

      // Save the incremental diff to the database
      // Convert Uint8Array to base64 or hex string depending on how your Supabase handles bytea
      const hexDiff = toHex(diffUpdate);

      const { data: newVersion, error: insertError } = await supabase
        .from('project_versions')
        .insert({
          project_id: projectId,
          version_description: versionDescription,
          created_by: userId,
          yjs_state: hexDiff 
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setIsVersioning(false);
      return { success: true, data: newVersion };

    } catch (err: any) {
      console.error("❌ Error creating version:", err.message);
      setVersionError(err.message);
      setIsVersioning(false);
      return { success: false, error: err.message };
    }
  };

  const updateVersion = async (
    projectId: string,
    liveDoc: Y.Doc,
    userId: string,
    versionDescription: string
  ) => {
    setIsVersioning(true);
    setVersionError(null);

    try {
      // Fetch the existing history
      const { data: pastVersions, error: fetchError } = await supabase
        .from('project_versions')
        .select('version_id, yjs_state')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // If there are no versions at all, create the first one
      if (!pastVersions || pastVersions.length === 0) {
        const result = await createVersion(projectId, liveDoc, userId, versionDescription);
        setIsVersioning(false);
        return result;
      }

      let numVersions = pastVersions.length;

      // Find the latest version to overwrite
      const latestVersion = pastVersions[numVersions - 1];

      // Reconstruct the database's knowledge UP TO the version BEFORE the latest one
      const tempDoc = new Y.Doc();
      for (let i = 0; i < numVersions - 1; i++) {
        if (pastVersions[i].yjs_state) {
          const updateMap = fromHex(pastVersions[i].yjs_state);
          Y.applyUpdate(tempDoc, updateMap);
        }
      }

      // Get the state vector of the temp doc (everything before the current version)
      const dbStateVector = Y.encodeStateVector(tempDoc);
      
      // Calculate the exact diff against everything BEFORE the latest version
      const diffUpdate = Y.encodeStateAsUpdate(liveDoc, dbStateVector);
      const hexDiff = toHex(diffUpdate);

      // Overwrite the latest version row
      const { data: updatedVersion, error: updateError } = await supabase
        .from('project_versions')
        .update({
          version_description: versionDescription,
          yjs_state: hexDiff
        })
        .eq('version_id', latestVersion.version_id)
        .select()
        .single();

      if (updateError) throw updateError;

      setIsVersioning(false);
      return { success: true, data: updatedVersion };

    } catch (err: any) {
      console.error("❌ Error updating version:", err.message);
      setVersionError(err.message);
      setIsVersioning(false);
      return { success: false, error: err.message };
    }
  };

  return { createVersion, updateVersion, isVersioning, versionError };
};


// const deleteVersion = async (projectId: string, versionIdToDelete: string) => {
//     setIsVersioning(true);
//     setVersionError(null);

//     try {
//       // 1. Fetch all versions in chronological order
//       const { data: versions, error: fetchError } = await supabase
//         .from('project_versions')
//         .select('version_id, yjs_state')
//         .eq('project_id', projectId)
//         .order('created_at', { ascending: true });

//       if (fetchError) throw fetchError;
//       if (!versions || versions.length === 0) throw new Error("No versions found.");

//       const targetIndex = versions.findIndex(v => v.version_id === versionIdToDelete);
//       if (targetIndex === -1) throw new Error("Version not found.");

//       // SCENARIO A: It's the newest version. Nothing depends on it, just delete it.
//       if (targetIndex === versions.length - 1) {
//         const { error: deleteError } = await supabase
//           .from('project_versions')
//           .delete()
//           .eq('version_id', versionIdToDelete);

//         if (deleteError) throw deleteError;
//         setIsVersioning(false);
//         return { success: true, message: "Latest version deleted." };
//       }

//       // SCENARIO B & C: It's a middle version or the base version. We must squash it with the next version.
//       const docPrev = new Y.Doc();
//       const docNext = new Y.Doc();

//       // Apply updates up to the version BEFORE the one we are deleting
//       for (let i = 0; i < targetIndex; i++) {
//         const update = new Uint8Array(Buffer.from(versions[i].yjs_state, 'base64'));
//         Y.applyUpdate(docPrev, update);
//       }

//       // Apply updates up to the version AFTER the one we are deleting (the target index + 1)
//       for (let i = 0; i <= targetIndex + 1; i++) {
//         const update = new Uint8Array(Buffer.from(versions[i].yjs_state, 'base64'));
//         Y.applyUpdate(docNext, update);
//       }

//       // Generate the State Vector of the previous state
//       // (If we are deleting index 0, docPrev is empty, so svPrev is empty, which correctly forces a full snapshot!)
//       const svPrev = Y.encodeStateVector(docPrev);
      
//       // Generate the squashed diff
//       const squashedUpdate = Y.encodeStateAsUpdate(docNext, svPrev);
//       const base64Squashed = Buffer.from(squashedUpdate).toString('base64');

//       const nextVersionId = versions[targetIndex + 1].version_id;

//       // Update the NEXT version with the squashed diff
//       const { error: updateError } = await supabase
//         .from('project_versions')
//         .update({ yjs_state: base64Squashed })
//         .eq('version_id', nextVersionId);

//       if (updateError) throw updateError;

//       // Now safely delete the target version
//       const { error: deleteError } = await supabase
//         .from('project_versions')
//         .delete()
//         .eq('version_id', versionIdToDelete);

//       if (deleteError) throw deleteError;

//       setIsVersioning(false);
//       return { success: true, message: "Version successfully squashed and deleted." };

//     } catch (err: any) {
//       console.error("❌ Error deleting version:", err.message);
//       setVersionError(err.message);
//       setIsVersioning(false);
//       return { success: false, error: err.message };
//     }
//   };