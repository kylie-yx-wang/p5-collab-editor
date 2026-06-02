"use client";

import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting, syntaxTree } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Toolbar } from "@/components/Toolbar";
import { editTools } from "@/lib/editTools";
import { linter, lintGutter } from "@codemirror/lint";
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';

interface EditorProps {
  code: string;
  onUpdate: (newText: string) => void;
  roomId: string;
  onRun: () => void;
  autoRunState: boolean;
  toggleAuto: ( autoOn : boolean ) => void;
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
    zIndex: "10", 
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

const friendlyLinter = linter((view) => {
  const diagnostics: any[] = [];
  
  // Scan the invisible syntax tree for broken code
  syntaxTree(view.state).cursor().iterate(node => {
    if (node.type.isError) {
      
      // Grab the specific text causing the error to provide better context
      const errorText = view.state.sliceDoc(node.from, node.to);
      
      // If errorText is empty, it usually means something is missing
      const visualText = errorText.trim() === "" ? "[Empty Space / Missing Token]" : errorText;
      
      diagnostics.push({
        from: node.from,
        to: node.to,
        severity: "error",
        // Displays the raw text inside the popup box
        message: `[DEBUG] errorText caught: "${visualText}"`,
      });
    }
  });
  
  return diagnostics;
});

export const Editor = ({ code, onUpdate, roomId, onRun, autoRunState, toggleAuto}: EditorProps) => {
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
        editTools(), // drag to edit numbers, color picker

        // friendly error messages
        lintGutter(), 
        friendlyLinter,    

        keymap.of([indentWithTab]), // tab to indent
        
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
    // UI wrapper to match the light theme
    <div className="flex-1 flex flex-col border-r border-gray-200 overflow-hidden bg-[#fdfdfd]">
      <Toolbar 
        roomId={roomId} 
        onRun={onRun}
        toggleAuto={toggleAuto}
        autoRunState={autoRunState}
      />

      {/* h-full so it stretches perfectly */}
      <div className="flex-1 overflow-auto h-full" ref={editorRef} />
    </div>
  );
};