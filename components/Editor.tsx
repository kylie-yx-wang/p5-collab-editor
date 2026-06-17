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
  ytext: Y.Text | null; // allow null while loading
  provider: WebsocketProvider | null; // allow null while loading
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

// looks at the word the user is currently typing and matches it to documentation
function p5Completion(context: CompletionContext) {
  // Grab the word right before the cursor
  let word = context.matchBefore(/\w*/);
  if (!word || (word.from == word.to && !context.explicit))
    return null;

  return {
    from: word.from,
    options: p5BasicDocs // Feed to doc sheet
  };
}

export const Editor = ({ roomId, onRun, toggles, ytext, provider }: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const docsCompartment = useRef(new Compartment());

  // Helper function for which documentation extensions should be active
  const getDocsExtensions = (currentToggles: { jsHelp: boolean; p5Help: boolean }) => {
    const activeExtensions = [];
    
    if (currentToggles.p5Help && currentToggles.jsHelp) {
      activeExtensions.push(javascriptLanguage.data.of({
        autocomplete: p5Completion
      }));
    } else if (currentToggles.p5Help) { // only p5 help
      activeExtensions.push(autocompletion({ override: [p5Completion] }));
    } else if (currentToggles.jsHelp) { // only js help
      activeExtensions.push(autocompletion({}));
    }
    
    return activeExtensions;
  };

  // Core Hook runs safely at the top level
  useEffect(() => {
    // Only spin up CodeMirror if the elements exist and Yjs has fully connected
    if (!editorRef.current || !ytext || !provider) return;

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,                
        javascript(),              
        
        // custom colours
        lightArtTheme,                           
        syntaxHighlighting(lightHighlightStyle),   

        // number slider & color picker tools
        editTools(), 

        // friendly error messages
        lintGutter(), 
        friendlyLinter,    

        // yCollab for syncing text & cursors
        yCollab(ytext, provider.awareness),

        // documentation
        docsCompartment.current.of(getDocsExtensions(toggles)),

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

  useEffect(() => {
    if (viewRef.current) {
      // Hot-swap the extensions without destroying the Yjs connection
      viewRef.current.dispatch({
        effects: docsCompartment.current.reconfigure(getDocsExtensions(toggles))
      });
    }
  }, [toggles]);

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
      <div className="flex-1 overflow-auto h-full" ref={editorRef} />
    </div>
  );
};