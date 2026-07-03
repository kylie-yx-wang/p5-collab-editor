// hooks/useLocalEditor.ts
import { useState, useEffect } from 'react';
import * as Y from 'yjs';

const codeTemplate = `function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  fill(255, 0, 0);
  ellipse(mouseX, mouseY, 50, 50);
}
`;

// utils/yjs-parser.ts

// utils/yjs-parser.ts

export const parseYjsUpdate = (data: any): Uint8Array | null => {
  if (!data) return null;
  if (data instanceof Uint8Array) return data;

  try {
    // 1. Handle { type: "Buffer", data: [...] } (Very common Supabase/Node JS serialization)
    if (data.type === 'Buffer' && Array.isArray(data.data)) {
      return new Uint8Array(data.data);
    }

    // 2. Handle stringified JSON arrays (e.g., "[1, 2, 3]")
    if (typeof data === 'string' && data.trim().startsWith('[')) {
      return new Uint8Array(JSON.parse(data));
    }

    // 3. Handle stringified JSON objects (e.g., '{"0": 1, "1": 2}')
    if (typeof data === 'string' && data.trim().startsWith('{')) {
      return new Uint8Array(Object.values(JSON.parse(data)));
    }

    // 4. Handle Supabase Postgres bytea hex strings (starts with \x)
    if (typeof data === 'string' && data.startsWith('\\x')) {
      const hex = data.slice(2);
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }
      return bytes;
    }

    // 5. Handle Base64 strings
    if (typeof data === 'string') {
      // Basic check to see if it looks like base64 (no spaces, standard chars)
      if (/^[A-Za-z0-9+/=]+$/.test(data)) {
         return Uint8Array.from(atob(data), c => c.charCodeAt(0));
      }
    }

    // 6. Handle standard Arrays
    if (Array.isArray(data)) {
      return new Uint8Array(data);
    }

    // 7. Handle Objects with numeric keys
    if (typeof data === 'object' && Object.keys(data).length > 0) {
      return new Uint8Array(Object.values(data));
    }

  } catch (e) {
    console.warn("[YJS PARSER] Failed to sanitize database update data.", e);
  }

  console.warn("[YJS PARSER] Unrecognized data format received:", data);
  return null;
};

export const useLocalEditor = (initialState?: any) => {
  const [state, setState] = useState<{ ydoc: Y.Doc | null, ytext: Y.Text | null, code: string, provider: null }>({
    ydoc: null,
    ytext: null,
    code: '// Loading...',
    provider: null
  });

  useEffect(() => {
    if (initialState === undefined) return; // Still loading DB fetch

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('codemirror');

    // Load DB state or template
    if (initialState === null) {
      ytext.insert(0, codeTemplate);
    } else {
      try {
        const update = parseYjsUpdate(initialState);
        console.log("[LOCAL EDITOR] Parsed update length:", update?.length);
        
        if (update && update.length > 0) {
          Y.applyUpdate(ydoc, update);
          console.log("[LOCAL EDITOR] Successfully applied Yjs update.");
        } else {
          console.log("[LOCAL EDITOR] Update was null/empty. Inserting template.");
        }
        
        if (ytext.length === 0) ytext.insert(0, codeTemplate);
      } catch (e) {
        console.warn("[LOCAL EDITOR] Yjs threw an error during applyUpdate. Corrupt data? Inserting template.", e);
        if (ytext.length === 0) ytext.insert(0, codeTemplate);
      }
    }

    // Keep the React state synced so the "Run" button gets the newest local code
    const handleTextChange = () => {
      setState({ ydoc, ytext, code: ytext.toString(), provider: null });
    };

    ytext.observe(handleTextChange);
    handleTextChange(); // Initial set

    return () => {
      ytext.unobserve(handleTextChange);
      ydoc.destroy();
    };
  }, [initialState]);

  return state;
};