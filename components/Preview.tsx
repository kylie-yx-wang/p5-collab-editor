"use client";

import React, { useEffect, useRef, useState } from 'react';
import { generateP5Html } from "@/lib/p5-template";
import { translateRuntimeError, FriendlyError } from "@/lib/errorTranslator";

interface PreviewProps {
    code: string;
  }
export const Preview = ({ code }: PreviewProps) => {
    const [runtimeError, setRuntimeError] = useState<FriendlyError | null>(null);

    // Clear any existing errors whenever the running code changes
    useEffect(() => {
        setRuntimeError(null);
    }, [code]);

    // Listen for error updates arriving from the iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'P5_RUNTIME_ERROR') {
            const friendly = translateRuntimeError(event.data.message, event.data.stack);
            setRuntimeError(friendly);
        }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);
    return (
        
        <div className="flex-1 flex flex-col bg-white relative">
            <div className="bg-gray-200 text-gray-700 p-2 text-sm font-sans font-bold">Preview</div>

            {/**<!--Error message -->**/}
            {runtimeError ? (
        <div className="absolute inset-x-4 top-14 p-4 bg-red-50 border-l-4 border-red-500 rounded shadow-md font-sans animate-fade-in z-50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💡</span>
            <h3 className="text-red-800 font-bold text-sm">
              Error {runtimeError.line ? `on Line ${runtimeError.line}` : ''}
            </h3>
          </div>
          <p className="text-gray-700 text-sm font-medium mb-2">
            {runtimeError.message}
          </p>
          <p className="text-gray-500 text-xs italic bg-white p-2 rounded border border-red-100">
            {runtimeError.hint}
          </p>
        </div>
      ) : null}
            <iframe
            srcDoc={generateP5Html(code)}
            className="flex-1 border-none"
            title="p5-preview"
            sandbox="allow-scripts"
            />
        </div>
    );
};