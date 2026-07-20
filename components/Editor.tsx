"use client";

import React, { useEffect, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting, syntaxTree } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Toolbar } from "@/components/Toolbar";
import { editTools } from "@/lib/editTools";
import { linter, lintGutter } from "@codemirror/lint";
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { yCollab } from 'y-codemirror.next';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { p5BasicDocs } from '@/lib/p5Docs';

interface EditorProps {
  roomId: string;
  onRun: () => void;
  toggles: { jsHelp: boolean; p5Help: boolean }; 
  ytext: Y.Text | null;
  provider: WebsocketProvider | null;
  theme?: 'light' | 'dark'; 
}

// --- LIGHT THEME ---
const lightArtTheme = EditorView.theme({
  "&": { color: "#333", backgroundColor: "#fdfdfd", height: "100%" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": { padding: "20px 0", fontFamily: "monospace" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#ff0080", borderLeftWidth: "2px" },
  ".cm-gutters": { backgroundColor: "#f0f0f0", color: "#999", border: "none", zIndex: "10" },
  "&.cm-editor": { height: "100%" } 
}, { dark: false });

const lightHighlightStyle = HighlightStyle.define([
  { tag: t.function(t.variableName), color: "#000000" }, 
  { tag: t.number, color: "#2873b5" },                     
  { tag: t.variableName, color: "#ff0080" },             
  { tag: t.keyword, color: "#8a2be2", fontWeight: "bold" }, 
  { tag: t.string, color: "#119f98" },                      
  { tag: t.comment, color: "#989eA3", fontStyle: "italic" } 
]);

// --- DARK THEME (NEW) ---
const darkArtTheme = EditorView.theme({
  "&": { color: "#fdfdfd", backgroundColor: "#1e1e1e", height: "100%" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": { padding: "20px 0", fontFamily: "monospace" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#ff0080", borderLeftWidth: "2px" }, // Keeping the cool pink cursor!
  ".cm-gutters": { backgroundColor: "#252525", color: "#888", border: "none", zIndex: "10" },
  "&.cm-editor": { height: "100%" } 
}, { dark: true });

const darkHighlightStyle = HighlightStyle.define([
  { tag: t.function(t.variableName), color: "#e0e0e0" }, 
  { tag: t.number, color: "#4fc1ff" },                     
  { tag: t.variableName, color: "#ff0080" },             
  { tag: t.keyword, color: "#c678dd", fontWeight: "bold" }, // Neon purple
  { tag: t.string, color: "#2ce5b4" },                      // Minty teal                 
  { tag: t.comment, color: "#858585", fontStyle: "italic" } 
]);


const friendlyLinter = linter((view) => {
  const diagnostics: any[] = [];
  syntaxTree(view.state).cursor().iterate(node => {
    if (node.type.isError) {
      const errorText = view.state.sliceDoc(node.from, node.to);
      const visualText = errorText.trim() === "" ? "[Empty Space / Missing Token]" : errorText;
      diagnostics.push({
        from: node.from,
        to: node.to,
        severity: "error",
        message: `[DEBUG] errorText caught: "${visualText}"`,
      });
    }
  });
  return diagnostics;
});

function p5Completion(context: CompletionContext) {
  let word = context.matchBefore(/\w*/);
  if (!word || (word.from == word.to && !context.explicit)) return null;
  return {
    from: word.from,
    options: p5BasicDocs
  };
}

export const Editor = ({ roomId, onRun, toggles, ytext, provider, theme = 'light' }: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Compartments allow us to inject and swap configs without resetting the whole editor
  const docsCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment()); // <-- NEW COMPARTMENT

  const getDocsExtensions = (currentToggles: { jsHelp: boolean; p5Help: boolean }) => {
    const activeExtensions = [];
    if (currentToggles.p5Help && currentToggles.jsHelp) {
      activeExtensions.push(javascriptLanguage.data.of({ autocomplete: p5Completion }));
    } else if (currentToggles.p5Help) { 
      activeExtensions.push(autocompletion({ override: [p5Completion] }));
    } else if (currentToggles.jsHelp) { 
      activeExtensions.push(autocompletion({}));
    }
    return activeExtensions;
  };

  // Helper to grab the right theme based on the prop
  const getThemeExtensions = (currentTheme: 'light' | 'dark') => {
    if (currentTheme === 'dark') {
      return [darkArtTheme, syntaxHighlighting(darkHighlightStyle)];
    }
    return [lightArtTheme, syntaxHighlighting(lightHighlightStyle)];
  };

  // --- INITIALIZE EDITOR ---
  useEffect(() => {
    if (!editorRef.current || !ytext) return; 

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,                
        javascript(),              
        editTools(), 
        lintGutter(), 
        friendlyLinter,    
        yCollab(ytext, provider?.awareness),
        keymap.of([indentWithTab]), 
        
        // Inject our compartments with initial values
        docsCompartment.current.of(getDocsExtensions(toggles)),
        themeCompartment.current.of(getThemeExtensions(theme))
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [ytext, provider]); 

  //  LISTEN FOR TOGGLE CHANGES 
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: docsCompartment.current.reconfigure(getDocsExtensions(toggles))
      });
    }
  }, [toggles]);

  //  LISTEN FOR THEME CHANGES 
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: themeCompartment.current.reconfigure(getThemeExtensions(theme))
      });
    }
  }, [theme]);

  if (!ytext) {
    // Also updated the loading background to match if they are in dark mode!
    return (
      <div className={`flex-1 flex items-center justify-center font-bold ${theme === 'dark' ? 'bg-[#1e1e1e] text-gray-500' : 'bg-[#fdfdfd] text-gray-400'}`}>
        Loading canvas...
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col border-r ${theme === 'dark' ? 'border-[#333] bg-[#1e1e1e]' : 'border-gray-200 bg-[#fdfdfd]'} overflow-hidden`}>
      <div className="flex-1 overflow-auto h-full" ref={editorRef} />
    </div>
  );
};