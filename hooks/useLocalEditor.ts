// hooks/useLocalEditor.ts
import { useEffect, useState, useRef } from 'react';
import { fromHex } from '@/lib/utils';
import * as Y from 'yjs';

export const useLocalEditor = (initialState?: any) => {
  const yjsRef = useRef<{ ydoc: Y.Doc; ytext: Y.Text; } | null>(null);
  const [yjsState, setYjsState] = useState<{ ydoc: Y.Doc | null; ytext: Y.Text | null; provider: null; code: string; }>({ ydoc: null, ytext: null, provider: null, code: '' });

  useEffect(() => {
    if (initialState === undefined) return; 

    if (!yjsRef.current) {
      const ydoc = new Y.Doc();
      const ytext = ydoc.getText('codemirror');
      yjsRef.current = { ydoc, ytext };

      // Load DB state safely
      if (initialState) {
        try {
          const cleanUpdate = fromHex(initialState);
          Y.applyUpdate(ydoc, cleanUpdate);
          console.log("[LOCAL EDITOR] Successfully loaded DB state!");
        } catch (e) {
          console.error("[LOCAL EDITOR] Failed to parse hex state.", e);
        }
      }
    }

    const { ydoc, ytext } = yjsRef.current;

    const handleTextChange = () => {
      setYjsState({ ydoc, ytext, provider: null, code: ytext.toString() });
    };

    ytext.observe(handleTextChange);
    handleTextChange(); 

    return () => {
      ytext.unobserve(handleTextChange);
    };
  }, [initialState]); 

  // CLEANUP EFFECT (Runs on unmount)
  useEffect(() => {
    return () => {
      if (yjsRef.current) {
        yjsRef.current.ydoc.destroy();
        yjsRef.current = null;
      }
    };
  }, []);

  return yjsState;
};