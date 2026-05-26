"use client";

import React, { useEffect, useRef } from 'react';
import { generateP5Html } from "@/lib/p5-template";

interface PreviewProps {
    code: string;
  }
export const Preview = ({ code }: PreviewProps) => {
    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="bg-gray-200 text-gray-700 p-2 text-sm font-sans font-bold">Preview</div>
            <iframe
            srcDoc={generateP5Html(code)}
            className="flex-1 border-none"
            title="p5-preview"
            sandbox="allow-scripts"
            />
        </div>
    );
};