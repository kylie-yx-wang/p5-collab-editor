"use client";

import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

interface EditorProps {
  code: string;
  onUpdate: (newText: string) => void;
  roomId: string;
}

// LIGHT THEME
const lightArtTheme = EditorView.theme({
  "&": {
    color: "#333",
    backgroundColor: "#fdfdfd", 
    height: "100%",             // Ensures the editor fills the container
  },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": {
    padding: "20px 0",
    fontFamily: "monospace",
  },
  // CodeMirror uses a border for its cursor, not the default text caret
  ".cm-cursor, .cm-dropCursor": { 
    borderLeftColor: "#ff0080", // Bright pink 
    borderLeftWidth: "2px"      // Slightly thicker
  },
  ".cm-gutters": {
    backgroundColor: "#f0f0f0", 
    color: "#999",
    border: "none",
    width: "40px"
  },
  "&.cm-editor": { height: "100%" } 
}, { dark: false });


// SYNTAX HIGHLIGHTING
const lightHighlightStyle = HighlightStyle.define([
  // Black for functions (ellipse, rect, setup, draw)
  { tag: t.function(t.variableName), color: "#000000" }, 
  
  // BLUE for numbers.
  { tag: t.number, color: "#2873b5" },                     
  
  // PINK for variables and unrecognized words (mouseX, mouseY, helloabcd)
  { tag: t.variableName, color: "#ff0080" },             
  
  // Others
  { tag: t.keyword, color: "#8a2be2", fontWeight: "bold" }, // Purple (function, let)
  { tag: t.string, color: "#119f98" },                      // Teal strings
  { tag: t.comment, color: "#989eA3", fontStyle: "italic" } // Gray comments
]);

export const Editor = ({ code, onUpdate, roomId}: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,                
        javascript(),              
        lightArtTheme,                           // Apply custom UI colors
        syntaxHighlighting(lightHighlightStyle), // Apply custom text colors              
        
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onUpdate(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []); 

  useEffect(() => {
    if (viewRef.current) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (code !== currentDoc) {
        viewRef.current.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: code }
        });
      }
    }
  }, [code]);

  return (
    // Updated the outer UI wrapper to match the light theme
    <div className="flex-1 flex flex-col border-r border-gray-200 overflow-hidden bg-[#fdfdfd]">
      <div className="bg-white border-b border-gray-200 text-gray-500 p-2 text-sm font-mono flex justify-between shrink-0">
        <span className="font-bold text-pink-500">editor.js</span>
        <span className="text-sm font-bold text-gray-500">
            Room Code: <span className="text-purple-600">{roomId}</span>
        </span>
        {/* <span className="flex items-center gap-1 text-xs">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Connected
        </span> */}
      </div>
      {/* Removed the dark bg-[#282c34] and replaced with h-full so it stretches perfectly */}
      <div className="flex-1 overflow-auto h-full" ref={editorRef} />
    </div>
  );
};