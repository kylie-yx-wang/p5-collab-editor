"use client";

import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface EditorProps {
  code: string;
  onUpdate: (newText: string) => void;
}

export const Editor = ({ code, onUpdate }: EditorProps) => {
  // This ref is for the physical <div> in the DOM
  const editorRef = useRef<HTMLDivElement>(null);
  
  // This ref stores the Editor instance so we can update it without re-rendering
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    // If we haven't created the editor yet, do it
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,                // Adds line numbers, gutters, etc.
        javascript(),              // Syntax highlighting for JS
        oneDark,                   // Dark theme
        // Listen for changes in the editor
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

    // Destroy the editor when the component unmounts
    return () => {
      view.destroy();
    };
  }, []); // Empty array means this only runs once on "mount"

  // Important: Update the editor if the code changes from ANOTHER user (via Yjs)
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
    <div className="flex-1 flex flex-col border-r border-gray-700 overflow-hidden">
      <div className="bg-gray-800 text-white p-2 text-sm font-mono flex justify-between shrink-0">
        <span>editor.js</span>
        <span className="text-green-500 text-xs">● Connected</span>
      </div>
      {/* This is the "hook" where CodeMirror will inject itself */}
      <div className="flex-1 overflow-auto bg-[#282c34]" ref={editorRef} />
    </div>
  );
};