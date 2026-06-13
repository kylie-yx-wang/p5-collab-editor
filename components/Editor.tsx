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
import { yCollab } from 'y-codemirror.next';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { p5BasicDocs } from '@/lib/p5Docs';

interface EditorProps {
  roomId: string;
  onRun: () => void;
  autoRunState: boolean;
  toggleAuto: ( autoOn : boolean ) => void;
  ytext: Y.Text | null;            // Allow null while loading
  provider: WebsocketProvider | null; // Allow null while loading
}

const lightArtTheme = EditorView.theme({
  "&": {
    color: "#333",
    backgroundColor: "#fdfdfd", 
    height: "100%",             
  },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": {
    padding: "20px 0",
    fontFamily: "monospace",
  },
  ".cm-cursor, .cm-dropCursor": { 
    borderLeftColor: "#ff0080", 
    borderLeftWidth: "2px"      
  },
  ".cm-gutters": {
    backgroundColor: "#f0f0f0", 
    color: "#999",
    border: "none",
    zIndex: "10", 
  },
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

export const Editor = ({ roomId, onRun, autoRunState, toggleAuto, ytext, provider }: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Core Hook runs safely at the top level
  useEffect(() => {
    // Only spin up CodeMirror if the elements exist and Yjs has fully connected
    if (!editorRef.current || !ytext || !provider) return;

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,                
        javascript(),              
        lightArtTheme,                           
        syntaxHighlighting(lightHighlightStyle),   
        editTools(), 
        lintGutter(), 
        friendlyLinter,    

        // yCollab securely takes control over syncing text & cursors
        yCollab(ytext, provider.awareness),

        keymap.of([indentWithTab]), 
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
  }, [ytext, provider]); // Re-run when Yjs finishes loading from the server!

  // Safe UI conditional rendering at the bottom
  if (!ytext || !provider) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#fdfdfd] text-gray-400 font-bold">
        Connecting to collaborative canvas...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col border-r border-gray-200 overflow-hidden bg-[#fdfdfd]">
      <Toolbar 
        roomId={roomId} 
        onRun={onRun}
        toggleAuto={toggleAuto}
        autoRunState={autoRunState}
      />
      <div className="flex-1 overflow-auto h-full" ref={editorRef} />
    </div>
  );
};